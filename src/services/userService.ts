import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { User } from '../types/user';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

export async function createUserProfile(profile: User): Promise<User> {
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<User>;

  return {
    uid,
    displayName: data.displayName ?? 'DailyProof User',
    username: data.username ?? '@dailyproof',
    email: data.email ?? '',
    currentStreak:
      typeof data.currentStreak === 'number' ? data.currentStreak : 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<User | null> {
  const reference = doc(db, USERS_COLLECTION, uid);
  await updateDoc(reference, updates);
  return getUserProfile(uid);
}
