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
import { AppState } from 'react-native';

import {
  createCheckIn,
  createCheckInId,
  getCheckIns,
} from '../services/checkInService';
import {
  deleteCheckInPhoto,
  uploadCheckInPhoto,
} from '../services/storageService';
import { verifyCheckInPhoto } from '../services/verificationService';
import { CheckIn } from '../types/checkIn';
import { FeedPost } from '../types/feed';
import { Goal, GoalCategory } from '../types/goal';
import { useAuth } from './AuthContext';
import { useGoals } from './GoalContext';

export type CheckInSubmissionResult = {
  checkIn?: CheckIn;
  uploadedPhotoUrl: string;
  verification: {
    aiConfidence: number;
    aiResult: CheckIn['aiResult'];
    aiFeedback: string;
  };
};

type CheckInContextValue = {
  checkIns: CheckIn[];
  checkInFeedPosts: FeedPost[];
  isLoading: boolean;
  isUploading: boolean;
  isVerifying: boolean;
  error: string;
  hasCheckedInToday: (goalId: string) => boolean;
  submitCheckIn: (
    goal: Goal,
    photoUrl: string
  ) => Promise<CheckInSubmissionResult>;
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
      return 'Your check-in could not be saved right now. Please try again.';
    }

    if (error.message.includes('unavailable')) {
      return 'Check-ins are temporarily unavailable. Check your connection.';
    }

    if (
      error.message.includes('no longer exists') ||
      error.message.includes('do not have access') ||
      error.message.includes('captured photo')
    ) {
      return error.message;
    }

    if (
      error.message.includes('Photo upload') ||
      error.message.includes('Storage')
    ) {
      return 'Photo upload failed. Check your connection and try again.';
    }

    if (
      error.message.includes('OpenAI') ||
      error.message.includes('verification')
    ) {
      return 'AI verification could not be completed. Retry or retake the photo.';
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
  const [isVerifying, setIsVerifying] = useState(false);
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && firebaseUser) {
        void loadCheckIns();
      }
    });

    return () => subscription.remove();
  }, [firebaseUser, loadCheckIns]);

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

      const checkInId = createCheckInId();
      let uploadedPhotoUrl = '';

      try {
        setIsUploading(true);
        uploadedPhotoUrl = await uploadCheckInPhoto(
          firebaseUser.uid,
          checkInId,
          photoUrl
        );
        setIsUploading(false);

        setIsVerifying(true);
        const verification = await verifyCheckInPhoto(
          uploadedPhotoUrl,
          goal.category,
          goal.title
        );
        setIsVerifying(false);

        if (verification.aiResult !== 'approved') {
          await deleteCheckInPhoto(firebaseUser.uid, checkInId);
          return {
            uploadedPhotoUrl,
            verification,
          };
        }

        const result = await createCheckIn({
          id: checkInId,
          userId: firebaseUser.uid,
          goalId: goal.id,
          goalTitle: goal.title,
          category: goal.category,
          categoryEmoji: goal.categoryEmoji,
          photoUrl: uploadedPhotoUrl,
          ...verification,
        });

        setCheckIns((currentCheckIns) => [
          result.checkIn,
          ...currentCheckIns,
        ]);

        if (result.shouldIncrementGoal) {
          await refreshGoals();
        }

        return {
          checkIn: result.checkIn,
          uploadedPhotoUrl,
          verification,
        };
      } catch (submitError) {
        if (uploadedPhotoUrl) {
          await deleteCheckInPhoto(firebaseUser.uid, checkInId);
        }

        const errorMessage = getCheckInErrorMessage(submitError);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
        setIsVerifying(false);
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
      isVerifying,
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
      isVerifying,
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
