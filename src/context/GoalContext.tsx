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
} from '../services/goalService';
import { Goal, NewGoal } from '../types/goal';
import { useAuth } from './AuthContext';

type GoalContextValue = {
  goals: Goal[];
  activeGoals: Goal[];
  canAddGoal: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  addGoal: (goal: NewGoal) => Promise<boolean>;
  deleteGoal: (goalId: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
};

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

type GoalProviderProps = {
  children: ReactNode;
};

export function GoalProvider({ children }: GoalProviderProps) {
  const { firebaseUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const isCreatingGoal = useRef(false);
  const loadRequestId = useRef(0);

  const loadGoals = useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;

    if (!firebaseUser) {
      setGoals([]);
      setError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loadedGoals = await getGoals(firebaseUser.uid);
      if (loadRequestId.current === requestId) {
        setGoals(loadedGoals);
      }
    } catch (loadError) {
      if (loadRequestId.current === requestId) {
        setGoals([]);
        setError(getGoalErrorMessage(loadError));
      }
    } finally {
      if (loadRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [firebaseUser]);

  useEffect(() => {
    void loadGoals();

    return () => {
      loadRequestId.current += 1;
    };
  }, [loadGoals]);

  const refreshGoals = useCallback(async () => {
    await loadGoals();
  }, [loadGoals]);

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.isActive),
    [goals]
  );
  const canAddGoal = activeGoals.length < MAX_ACTIVE_GOALS;

  const addGoal = useCallback(
    async (newGoal: NewGoal) => {
      if (!firebaseUser || !canAddGoal) {
        return false;
      }

      if (isCreatingGoal.current) {
        return false;
      }

      isCreatingGoal.current = true;
      setIsSaving(true);
      setError('');

      try {
        const goal = await createGoal({
          ...newGoal,
          userId: firebaseUser.uid,
        });
        setGoals((currentGoals) => [goal, ...currentGoals]);
        return true;
      } catch (createError) {
        setError(getGoalErrorMessage(createError));
        return false;
      } finally {
        isCreatingGoal.current = false;
        setIsSaving(false);
      }
    },
    [canAddGoal, firebaseUser]
  );

  const deleteGoal = useCallback(async (goalId: string) => {
    setError('');

    try {
      await deleteStoredGoal(goalId);
      setGoals((currentGoals) =>
        currentGoals.filter((goal) => goal.id !== goalId)
      );
    } catch (deleteError) {
      setError(getGoalErrorMessage(deleteError));
    }
  }, []);

  const value = useMemo(
    () => ({
      goals,
      activeGoals,
      canAddGoal,
      isLoading,
      isSaving,
      error,
      addGoal,
      deleteGoal,
      refreshGoals,
    }),
    [
      goals,
      activeGoals,
      canAddGoal,
      isLoading,
      isSaving,
      error,
      addGoal,
      deleteGoal,
      refreshGoals,
    ]
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

function getGoalErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('up to 3 active goals')) {
      return error.message;
    }

    if (error.message.includes('permission-denied')) {
      return 'Goal access was denied. Check your Firestore rules.';
    }

    if (error.message.includes('unavailable')) {
      return 'Goals are temporarily unavailable. Check your connection.';
    }
  }

  return 'Something went wrong while working with your goals. Please try again.';
}

export function useGoals() {
  const context = useContext(GoalContext);

  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider.');
  }

  return context;
}
