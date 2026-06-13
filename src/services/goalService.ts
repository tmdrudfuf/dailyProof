import { Goal, NewGoal } from '../types/goal';
import { mockGoals } from './mockGoals';
import { readStoredJson, storageKeys, writeStoredJson } from './storage';

export const MAX_ACTIVE_GOALS = 3;

async function saveGoals(goals: Goal[]) {
  await writeStoredJson(storageKeys.goals, goals);
}

export async function getGoals(): Promise<Goal[]> {
  const goals = await readStoredJson<Goal[]>(storageKeys.goals, mockGoals);
  return Array.isArray(goals) ? goals : mockGoals;
}

export async function createGoal(newGoal: NewGoal): Promise<Goal> {
  const goals = await getGoals();
  const activeGoalCount = goals.filter((goal) => goal.isActive).length;

  if (activeGoalCount >= MAX_ACTIVE_GOALS) {
    throw new Error('You can have up to 3 active goals.');
  }

  const goal: Goal = {
    ...newGoal,
    id: `goal-${Date.now()}`,
    completedDays: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await saveGoals([goal, ...goals]);
  return goal;
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<Goal, 'id'>>
): Promise<Goal | null> {
  const goals = await getGoals();
  const existingGoal = goals.find((goal) => goal.id === goalId);

  if (!existingGoal) {
    return null;
  }

  const updatedGoal = { ...existingGoal, ...updates };
  await saveGoals(
    goals.map((goal) => (goal.id === goalId ? updatedGoal : goal))
  );
  return updatedGoal;
}

export async function deleteGoal(goalId: string): Promise<void> {
  const goals = await getGoals();
  await saveGoals(goals.filter((goal) => goal.id !== goalId));
}
