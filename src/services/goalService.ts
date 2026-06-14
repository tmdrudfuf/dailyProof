import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { Goal, GoalUpdates, NewGoal } from '../types/goal';
import { db } from './firebase';

export const MAX_ACTIVE_GOALS = 3;
const GOALS_COLLECTION = 'goals';

function sortNewestFirst(goals: Goal[]) {
  return [...goals].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
  );
}

export async function getGoals(userId: string): Promise<Goal[]> {
  const goalsQuery = query(
    collection(db, GOALS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(goalsQuery);
  const goals = snapshot.docs.map((goalDocument) => ({
    ...(goalDocument.data() as Omit<Goal, 'id'>),
    id: goalDocument.id,
  }));

  return sortNewestFirst(goals);
}

export async function getActiveGoals(userId: string): Promise<Goal[]> {
  const goals = await getGoals(userId);
  return goals.filter((goal) => goal.isActive);
}

export async function createGoal(
  newGoal: NewGoal & { userId: string }
): Promise<Goal> {
  const activeGoals = await getActiveGoals(newGoal.userId);

  if (activeGoals.length >= MAX_ACTIVE_GOALS) {
    throw new Error('You can have up to 3 active goals.');
  }

  const goalReference = doc(collection(db, GOALS_COLLECTION));
  const goal: Goal = {
    ...newGoal,
    id: goalReference.id,
    completedDays: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await setDoc(goalReference, goal);
  return goal;
}

export async function updateGoal(
  goalId: string,
  updates: GoalUpdates
): Promise<void> {
  await updateDoc(doc(db, GOALS_COLLECTION, goalId), updates);
}

export async function deleteGoal(goalId: string): Promise<void> {
  await deleteDoc(doc(db, GOALS_COLLECTION, goalId));
}
