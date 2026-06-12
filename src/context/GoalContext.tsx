import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mockGoals } from '../services/mockGoals';
import {
  readStoredJson,
  storageKeys,
  writeStoredJson,
} from '../services/storage';
import { Goal, NewGoal } from '../types/goal';

const MAX_ACTIVE_GOALS = 3;

type GoalContextValue = {
  goals: Goal[];
  activeGoals: Goal[];
  canAddGoal: boolean;
  addGoal: (goal: NewGoal) => boolean;
  deleteGoal: (goalId: string) => void;
  incrementGoalCompletedDays: (goalId: string) => void;
};

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

type GoalProviderProps = {
  children: ReactNode;
};

export function GoalProvider({ children }: GoalProviderProps) {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreGoals() {
      const storedGoals = await readStoredJson<Goal[]>(
        storageKeys.goals,
        mockGoals,
      );

      if (isMounted) {
        setGoals(Array.isArray(storedGoals) ? storedGoals : mockGoals);
        setIsHydrated(true);
      }
    }

    void restoreGoals();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void writeStoredJson(storageKeys.goals, goals);
    }
  }, [goals, isHydrated]);

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.isActive),
    [goals],
  );
  const canAddGoal = activeGoals.length < MAX_ACTIVE_GOALS;

  const addGoal = useCallback(
    (newGoal: NewGoal) => {
      if (!canAddGoal) {
        return false;
      }

      const goal: Goal = {
        ...newGoal,
        id: `goal-${Date.now()}`,
        completedDays: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      setGoals((currentGoals) => [goal, ...currentGoals]);
      return true;
    },
    [canAddGoal],
  );

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalId),
    );
  }, []);

  const incrementGoalCompletedDays = useCallback((goalId: string) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === goalId
          ? { ...goal, completedDays: goal.completedDays + 1 }
          : goal,
      ),
    );
  }, []);

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
    ],
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
