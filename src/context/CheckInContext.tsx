import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  createCheckIn,
  getCheckIns,
  getFeedItems,
} from '../services/checkInService';
import { CheckIn } from '../types/checkIn';
import { FeedPost } from '../types/feed';
import { Goal } from '../types/goal';
import { useGoals } from './GoalContext';

type CheckInContextValue = {
  checkIns: CheckIn[];
  checkInFeedPosts: FeedPost[];
  hasCheckedInToday: (goalId: string) => boolean;
  submitCheckIn: (goal: Goal, photoUrl: string) => Promise<CheckIn>;
};

const CheckInContext = createContext<CheckInContextValue | undefined>(
  undefined
);

type CheckInProviderProps = {
  children: ReactNode;
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

export function CheckInProvider({ children }: CheckInProviderProps) {
  const { incrementGoalCompletedDays } = useGoals();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [checkInFeedPosts, setCheckInFeedPosts] = useState<FeedPost[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreCheckInState() {
      const [storedCheckIns, storedFeedItems] = await Promise.all([
        getCheckIns(),
        getFeedItems(),
      ]);

      if (isMounted) {
        setCheckIns(storedCheckIns);
        setCheckInFeedPosts(storedFeedItems);
        setIsHydrated(true);
      }
    }

    void restoreCheckInState();

    return () => {
      isMounted = false;
    };
  }, []);

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
      const result = await createCheckIn(goal, photoUrl);

      setCheckIns((currentCheckIns) => [
        result.checkIn,
        ...currentCheckIns,
      ]);
      setCheckInFeedPosts((currentPosts) => [
        result.feedPost,
        ...currentPosts,
      ]);

      if (result.shouldIncrementGoal) {
        await incrementGoalCompletedDays(goal.id);
      }

      return result.checkIn;
    },
    [incrementGoalCompletedDays]
  );

  const value = useMemo(
    () => ({
      checkIns,
      checkInFeedPosts,
      hasCheckedInToday,
      submitCheckIn,
    }),
    [checkIns, checkInFeedPosts, hasCheckedInToday, submitCheckIn]
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
