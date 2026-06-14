import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from 'firebase/firestore';

import { CheckIn, NewCheckIn } from '../types/checkIn';
import { Goal } from '../types/goal';
import { auth, db } from './firebase';

const CHECK_INS_COLLECTION = 'checkIns';
const GOALS_COLLECTION = 'goals';

export type CreateCheckInResult = {
  checkIn: CheckIn;
  shouldIncrementGoal: boolean;
};

function sortNewestFirst(checkIns: CheckIn[]) {
  return [...checkIns].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
  );
}

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

export async function getCheckIns(userId: string): Promise<CheckIn[]> {
  const checkInsQuery = query(
    collection(db, CHECK_INS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(checkInsQuery);
  const checkIns = snapshot.docs.map((checkInDocument) => ({
    ...(checkInDocument.data() as Omit<CheckIn, 'id'>),
    id: checkInDocument.id,
  }));

  return sortNewestFirst(checkIns);
}

export async function getTodayCheckIns(userId: string): Promise<CheckIn[]> {
  const now = new Date().toISOString();
  return (await getCheckIns(userId)).filter((checkIn) =>
    isSameCalendarDay(checkIn.createdAt, now)
  );
}

export async function getCheckInsByGoal(goalId: string): Promise<CheckIn[]> {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    return [];
  }

  return (await getCheckIns(userId)).filter(
    (checkIn) => checkIn.goalId === goalId
  );
}

export async function hasCheckedInToday(
  userId: string,
  goalId: string
): Promise<boolean> {
  return (await getTodayCheckIns(userId)).some(
    (checkIn) => checkIn.goalId === goalId
  );
}

export async function createCheckIn(
  newCheckIn: NewCheckIn
): Promise<CreateCheckInResult> {
  const checkInReference = doc(collection(db, CHECK_INS_COLLECTION));
  const goalReference = doc(db, GOALS_COLLECTION, newCheckIn.goalId);
  const createdAt = new Date().toISOString();
  const today = getLocalDateKey(new Date(createdAt));
  const checkIn: CheckIn = {
    ...newCheckIn,
    id: checkInReference.id,
    createdAt,
  };

  const shouldIncrementGoal = await runTransaction(
    db,
    async (transaction) => {
      const goalSnapshot = await transaction.get(goalReference);

      if (!goalSnapshot.exists()) {
        throw new Error('The selected goal no longer exists.');
      }

      const goal = goalSnapshot.data() as Goal;
      if (goal.userId !== newCheckIn.userId) {
        throw new Error('You do not have access to this goal.');
      }

      const shouldIncrement =
        newCheckIn.aiResult === 'approved' &&
        goal.lastCompletedDate !== today;

      transaction.set(checkInReference, checkIn);

      if (shouldIncrement) {
        transaction.update(goalReference, {
          completedDays: goal.completedDays + 1,
          lastCompletedDate: today,
        });
      }

      return shouldIncrement;
    }
  );

  return { checkIn, shouldIncrementGoal };
}
