import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { UserProfile } from '../types/user';
import { auth, isFirebaseConfigured } from './firebase';
import { readStoredJson, storageKeys, writeStoredJson } from './storage';

type StoredProfiles = Record<string, UserProfile>;

type PendingSignupProfile = Pick<
  UserProfile,
  'displayName' | 'username' | 'createdAt'
>;

let pendingSignupProfile: PendingSignupProfile | null = null;

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* values to .env.local.'
    );
  }
}

function generateUsername(displayName: string) {
  const base =
    displayName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 18) || 'dailyproof';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `@${base}_${suffix}`;
}

async function saveUserProfile(profile: UserProfile) {
  const profiles = await readStoredJson<StoredProfiles>(
    storageKeys.userProfiles,
    {}
  );

  await writeStoredJson(storageKeys.userProfiles, {
    ...profiles,
    [profile.uid]: profile,
  });
}

export async function getUserProfile(
  user: User
): Promise<UserProfile> {
  const profiles = await readStoredJson<StoredProfiles>(
    storageKeys.userProfiles,
    {}
  );
  const storedProfile = profiles[user.uid];

  if (storedProfile) {
    return storedProfile;
  }

  const displayName =
    pendingSignupProfile?.displayName ??
    (user.displayName?.trim() ||
      user.email?.split('@')[0] ||
      'DailyProof User');
  const profile: UserProfile = {
    uid: user.uid,
    displayName,
    email: user.email ?? '',
    username:
      pendingSignupProfile?.username ?? generateUsername(displayName),
    createdAt:
      pendingSignupProfile?.createdAt ?? new Date().toISOString(),
  };

  await saveUserProfile(profile);
  return profile;
}

export async function signUp(
  displayName: string,
  email: string,
  password: string
): Promise<UserProfile> {
  assertFirebaseConfigured();
  pendingSignupProfile = {
    displayName: displayName.trim(),
    username: generateUsername(displayName),
    createdAt: new Date().toISOString(),
  };

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const profile: UserProfile = {
      uid: credential.user.uid,
      displayName: pendingSignupProfile.displayName,
      email: credential.user.email ?? email.trim(),
      username: pendingSignupProfile.username,
      createdAt: pendingSignupProfile.createdAt,
    };

    await saveUserProfile(profile);

    try {
      await updateProfile(credential.user, {
        displayName: profile.displayName,
      });
    } catch {
      // The local profile remains usable if the optional Auth profile sync fails.
    }

    return profile;
  } finally {
    pendingSignupProfile = null;
  }
}

export async function signIn(email: string, password: string) {
  assertFirebaseConfigured();
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  return getUserProfile(credential.user);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

export function getReadableAuthError(error: unknown) {
  if (
    error instanceof Error &&
    error.message.startsWith('Firebase is not configured.')
  ) {
    return error.message;
  }

  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.';
  }

  const messages: Record<string, string> = {
    'auth/email-already-in-use':
      'An account already exists with this email.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      'Firebase is not configured yet. Check your .env.local values.',
    'auth/invalid-api-key':
      'Firebase is not configured yet. Check your .env.local values.',
    'auth/configuration-not-found':
      'Enable Email/Password sign-in in the Firebase Console.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/missing-password': 'Enter your password.',
    'auth/network-request-failed':
      'Unable to connect. Check your internet connection.',
    'auth/operation-not-allowed':
      'Email and password sign-in is not enabled in Firebase.',
    'auth/too-many-requests':
      'Too many attempts. Please wait and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account was found for this email.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/wrong-password': 'The email or password is incorrect.',
  };

  return (
    messages[error.code] ??
    'Authentication failed. Check your details and try again.'
  );
}
