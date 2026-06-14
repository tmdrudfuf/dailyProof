import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  createCheckIn,
  getCheckIns,
} from '../services/checkInService';
import { verifyCheckInPhoto } from '../services/verificationService';
import { CheckIn } from '../types/checkIn';
import { FeedPost } from '../types/feed';
import { Goal, GoalCategory } from '../types/goal';
import { useAuth } from './AuthContext';
import { useGoals } from './GoalContext';

type CheckInContextValue = {
  checkIns: CheckIn[];
  checkInFeedPosts: FeedPost[];
  isLoading: boolean;
  isUploading: boolean;
  error: string;
  hasCheckedInToday: (goalId: string) => boolean;
  submitCheckIn: (goal: Goal, photoUrl: string) => Promise<CheckIn>;
  refreshCheckIns: () => Promise<void>;
};

const CheckInContext = createContext<CheckInContextValue | undefined>(
  undefined
);

type CheckInProviderProps = {
  children: ReactNode;
};

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameCalendarDay(firstDate: string, secondDate: string) {
  return (
    getLocalDateKey(new Date(firstDate)) ===
    getLocalDateKey(new Date(secondDate))
  );
}

function getVisual(category: GoalCategory): FeedPost['visual'] {
  if (category === 'Exercise') {
    return 'run';
  }

  if (category === 'Reading') {
    return 'read';
  }

  return 'build';
}

function getInitials(displayName: string) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || 'DP';
}

function getCheckInErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('permission-denied')) {
      return 'Check-in access was denied. Check your Firestore rules.';
    }

    if (error.message.includes('unavailable')) {
      return 'Check-ins are temporarily unavailable. Check your connection.';
    }

    if (
      error.message.includes('no longer exists') ||
      error.message.includes('do not have access') ||
      error.message.includes('Photo upload') ||
      error.message.includes('captured photo')
    ) {
      return error.message;
    }
  }

  return 'Something went wrong with your check-in. Please try again.';
}

export function CheckInProvider({ children }: CheckInProviderProps) {
  const { firebaseUser, profile } = useAuth();
  const { goals, refreshGoals } = useGoals();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const loadRequestId = useRef(0);

  const loadCheckIns = useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;

    if (!firebaseUser) {
      setCheckIns([]);
      setError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loadedCheckIns = await getCheckIns(firebaseUser.uid);
      if (loadRequestId.current === requestId) {
        setCheckIns(loadedCheckIns);
      }
    } catch (loadError) {
      if (loadRequestId.current === requestId) {
        setCheckIns([]);
        setError(getCheckInErrorMessage(loadError));
      }
    } finally {
      if (loadRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [firebaseUser]);

  useEffect(() => {
    void loadCheckIns();

    return () => {
      loadRequestId.current += 1;
    };
  }, [loadCheckIns]);

  const refreshCheckIns = useCallback(async () => {
    await loadCheckIns();
  }, [loadCheckIns]);

  const hasCheckedInToday = useCallback(
    (goalId: string) => {
      const now = new Date().toISOString();
      return checkIns.some(
        (checkIn) =>
          checkIn.goalId === goalId &&
          isSameCalendarDay(checkIn.createdAt, now)
      );
    },
    [checkIns]
  );

  const submitCheckIn = useCallback(
    async (goal: Goal, photoUrl: string) => {
      if (!firebaseUser) {
        throw new Error('You must be logged in to check in.');
      }

      setError('');

      try {
        const verification = await verifyCheckInPhoto(
          photoUrl,
          goal.category,
          goal.title
        );
        setIsUploading(true);
        const result = await createCheckIn({
          userId: firebaseUser.uid,
          goalId: goal.id,
          goalTitle: goal.title,
          category: goal.category,
          categoryEmoji: goal.categoryEmoji,
          photoUrl,
          ...verification,
        });

        setCheckIns((currentCheckIns) => [
          result.checkIn,
          ...currentCheckIns,
        ]);

        if (result.shouldIncrementGoal) {
          await refreshGoals();
        }

        return result.checkIn;
      } catch (submitError) {
        const errorMessage = getCheckInErrorMessage(submitError);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [firebaseUser, refreshGoals]
  );

  const checkInFeedPosts = useMemo<FeedPost[]>(() => {
    const displayName =
      profile?.displayName ?? firebaseUser?.displayName ?? 'You';
    const initials = getInitials(displayName);

    return checkIns.map((checkIn) => {
      const goal = goals.find((item) => item.id === checkIn.goalId);

      return {
        id: checkIn.id,
        friendName: displayName,
        initials,
        goal: checkIn.goalTitle,
        proof: "Checked in and kept today's promise.",
        timeAgo: 'Just now',
        streak: goal?.completedDays ?? 0,
        reactions: 0,
        visual: getVisual(checkIn.category),
        categoryEmoji: checkIn.categoryEmoji,
        photoUrl: checkIn.photoUrl,
        isCheckIn: true,
        createdAt: checkIn.createdAt,
      };
    });
  }, [checkIns, firebaseUser, goals, profile]);

  const value = useMemo(
    () => ({
      checkIns,
      checkInFeedPosts,
      isLoading,
      isUploading,
      error,
      hasCheckedInToday,
      submitCheckIn,
      refreshCheckIns,
    }),
    [
      checkIns,
      checkInFeedPosts,
      isLoading,
      isUploading,
      error,
      hasCheckedInToday,
      submitCheckIn,
      refreshCheckIns,
    ]
  );

  return (
    <CheckInContext.Provider value={value}>
      {children}
    </CheckInContext.Provider>
  );
}

export function useCheckIns() {
  const context = useContext(CheckInContext);

  if (!context) {
    throw new Error('useCheckIns must be used within a CheckInProvider.');
  }

  return context;
}
