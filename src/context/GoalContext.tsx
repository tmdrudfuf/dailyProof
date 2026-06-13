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
  createGoal,
  deleteGoal as deleteStoredGoal,
  getGoals,
  MAX_ACTIVE_GOALS,
  updateGoal,
} from '../services/goalService';
import { Goal, NewGoal } from '../types/goal';

type GoalContextValue = {
  goals: Goal[];
  activeGoals: Goal[];
  canAddGoal: boolean;
  addGoal: (goal: NewGoal) => Promise<boolean>;
  deleteGoal: (goalId: string) => Promise<void>;
  incrementGoalCompletedDays: (goalId: string) => Promise<void>;
};

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

type GoalProviderProps = {
  children: ReactNode;
};

export function GoalProvider({ children }: GoalProviderProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const isCreatingGoal = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreGoals() {
      const storedGoals = await getGoals();

      if (isMounted) {
        setGoals(storedGoals);
        setIsHydrated(true);
      }
    }

    void restoreGoals();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.isActive),
    [goals]
  );
  const canAddGoal = activeGoals.length < MAX_ACTIVE_GOALS;

  const addGoal = useCallback(
    async (newGoal: NewGoal) => {
      if (!canAddGoal) {
        return false;
      }

      if (isCreatingGoal.current) {
        return false;
      }

      isCreatingGoal.current = true;

      try {
        const goal = await createGoal(newGoal);
        setGoals((currentGoals) => [goal, ...currentGoals]);
        return true;
      } catch {
        return false;
      } finally {
        isCreatingGoal.current = false;
      }
    },
    [canAddGoal]
  );

  const deleteGoal = useCallback(async (goalId: string) => {
    await deleteStoredGoal(goalId);
    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalId)
    );
  }, []);

  const incrementGoalCompletedDays = useCallback(
    async (goalId: string) => {
      const goal = goals.find((item) => item.id === goalId);

      if (!goal) {
        return;
      }

      const updatedGoal = await updateGoal(goalId, {
        completedDays: goal.completedDays + 1,
      });

      if (updatedGoal) {
        setGoals((currentGoals) =>
          currentGoals.map((item) =>
            item.id === goalId ? updatedGoal : item
          )
        );
      }
    },
    [goals]
  );

  const value = useMemo(
    () => ({
      goals,
      activeGoals,
      canAddGoal,
      addGoal,
      deleteGoal,
      incrementGoalCompletedDays,
    }),
    [
      goals,
      activeGoals,
      canAddGoal,
      addGoal,
      deleteGoal,
      incrementGoalCompletedDays,
    ]
  );

  if (!isHydrated) {
    return null;
  }

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals() {
  const context = useContext(GoalContext);

  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider.');
  }

  return context;
}
