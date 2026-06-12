import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useGoals } from './GoalContext';
import {
  readStoredJson,
  storageKeys,
  writeStoredJson,
} from '../services/storage';
import { verifyCheckInPhoto } from '../services/verificationService';
import { CheckIn } from '../types/checkIn';
import { FeedPost } from '../types/feed';
import { Goal } from '../types/goal';

const LOCAL_USER_ID = 'local-user';

type CheckInContextValue = {
  checkIns: CheckIn[];
  checkInFeedPosts: FeedPost[];
  hasCheckedInToday: (goalId: string) => boolean;
  submitCheckIn: (goal: Goal, photoUrl: string) => Promise<CheckIn>;
};

const CheckInContext = createContext<CheckInContextValue | undefined>(
  undefined,
);

type CheckInProviderProps = {
  children: ReactNode;
};

type StoredCheckInState = {
  checkIns: CheckIn[];
  checkInFeedPosts: FeedPost[];
};

const emptyCheckInState: StoredCheckInState = {
  checkIns: [],
  checkInFeedPosts: [],
};

function isSameCalendarDay(firstDate: string, secondDate: string) {
  const first = new Date(firstDate);
  const second = new Date(secondDate);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getVisual(goal: Goal): FeedPost['visual'] {
  if (goal.category === 'Exercise') {
    return 'run';
  }

  if (goal.category === 'Reading') {
    return 'read';
  }

  return 'build';
}

export function CheckInProvider({ children }: CheckInProviderProps) {
  const { incrementGoalCompletedDays } = useGoals();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [checkInFeedPosts, setCheckInFeedPosts] = useState<FeedPost[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreCheckInState() {
      const storedState = await readStoredJson<StoredCheckInState>(
        storageKeys.checkInState,
        emptyCheckInState,
      );

      if (isMounted) {
        setCheckIns(
          Array.isArray(storedState?.checkIns)
            ? storedState.checkIns.map((checkIn) => ({
                ...checkIn,
                aiFeedback:
                  checkIn.aiFeedback ??
                  'Verification completed for this saved check-in.',
              }))
            : [],
        );
        setCheckInFeedPosts(
          Array.isArray(storedState?.checkInFeedPosts)
            ? storedState.checkInFeedPosts
            : [],
        );
        setIsHydrated(true);
      }
    }

    void restoreCheckInState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void writeStoredJson<StoredCheckInState>(storageKeys.checkInState, {
        checkIns,
        checkInFeedPosts,
      });
    }
  }, [checkIns, checkInFeedPosts, isHydrated]);


  const hasCheckedInToday = useCallback(
    (goalId: string) => {
      const now = new Date().toISOString();
      return checkIns.some(
        (checkIn) =>
          checkIn.goalId === goalId &&
          isSameCalendarDay(checkIn.createdAt, now),
      );
    },
    [checkIns],
  );

  const submitCheckIn = useCallback(
    async (goal: Goal, photoUrl: string) => {
      const createdAt = new Date().toISOString();
      const alreadyCountedToday = checkIns.some(
        (checkIn) =>
          checkIn.goalId === goal.id &&
          isSameCalendarDay(checkIn.createdAt, createdAt),
      );
      const verification = await verifyCheckInPhoto(
        photoUrl,
        goal.category,
        goal.title,
      );
      const id = `check-in-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const checkIn: CheckIn = {
        id,
        goalId: goal.id,
        userId: LOCAL_USER_ID,
        photoUrl,
        ...verification,
        createdAt,
      };

      const feedPost: FeedPost = {
        id,
        friendName: 'Ky',
        initials: 'KY',
        goal: goal.title,
        proof: 'Checked in and kept today’s promise.',
        timeAgo: 'Just now',
        streak: alreadyCountedToday
          ? goal.completedDays
          : goal.completedDays + 1,
        reactions: 0,
        visual: getVisual(goal),
        categoryEmoji: goal.categoryEmoji,
        photoUrl,
        isCheckIn: true,
        createdAt,
      };

      setCheckIns((currentCheckIns) => [checkIn, ...currentCheckIns]);
      setCheckInFeedPosts((currentPosts) => [feedPost, ...currentPosts]);

      if (verification.aiResult === 'approved' && !alreadyCountedToday) {
        incrementGoalCompletedDays(goal.id);
      }

      return checkIn;
    },
    [checkIns, incrementGoalCompletedDays],
  );

  const value = useMemo(
    () => ({
      checkIns,
      checkInFeedPosts,
      hasCheckedInToday,
      submitCheckIn,
    }),
    [checkIns, checkInFeedPosts, hasCheckedInToday, submitCheckIn],
  );

  if (!isHydrated) {
    return null;
  }

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
