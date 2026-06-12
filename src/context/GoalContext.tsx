import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { mockGoals } from '../services/mockGoals';
import { Goal, NewGoal } from '../types/goal';

const MAX_ACTIVE_GOALS = 3;

type GoalContextValue = {
  goals: Goal[];
  activeGoals: Goal[];
  canAddGoal: boolean;
  addGoal: (goal: NewGoal) => boolean;
};

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

type GoalProviderProps = {
  children: ReactNode;
};

export function GoalProvider({ children }: GoalProviderProps) {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
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

  const value = useMemo(
    () => ({ goals, activeGoals, canAddGoal, addGoal }),
    [goals, activeGoals, canAddGoal, addGoal],
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoals() {
  const context = useContext(GoalContext);

  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider.');
  }

  return context;
}
