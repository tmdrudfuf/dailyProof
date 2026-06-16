import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';

import { User } from '../types/user';
import { auth, isFirebaseConfigured } from './firebase';
import {
  createUserProfile,
  getUserProfile,
} from './userService';

type PendingSignupProfile = Pick<
  User,
  'displayName' | 'username' | 'createdAt'
>;

let pendingSignupProfile: PendingSignupProfile | null = null;

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Sign-in is not configured yet. Add the app configuration values to .env.local.'
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

export async function loadUserProfile(
  firebaseUser: FirebaseUser
): Promise<User> {
  const existingProfile = await getUserProfile(firebaseUser.uid);

  if (existingProfile) {
    return existingProfile;
  }

  const displayName =
    pendingSignupProfile?.displayName ??
    (firebaseUser.displayName?.trim() ||
      firebaseUser.email?.split('@')[0] ||
      'DailyProof User');
  const profile: User = {
    uid: firebaseUser.uid,
    displayName,
    email: firebaseUser.email ?? '',
    username:
      pendingSignupProfile?.username ?? generateUsername(displayName),
    currentStreak: 0,
    createdAt:
      pendingSignupProfile?.createdAt ?? new Date().toISOString(),
  };

  return createUserProfile(profile);
}

export async function signUp(
  displayName: string,
  email: string,
  password: string
): Promise<User> {
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
    const profile: User = {
      uid: credential.user.uid,
      displayName: pendingSignupProfile.displayName,
      email: credential.user.email ?? email.trim(),
      username: pendingSignupProfile.username,
      currentStreak: 0,
      createdAt: pendingSignupProfile.createdAt,
    };

    await createUserProfile(profile);

    try {
      await updateProfile(credential.user, {
        displayName: profile.displayName,
      });
    } catch {
      // Firestore remains the source of truth for the app profile.
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
  return loadUserProfile(credential.user);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

export function getReadableAuthError(error: unknown) {
  if (
    error instanceof Error &&
    error.message.startsWith('Sign-in is not configured yet.')
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
      'Sign-in is not configured yet. Check your .env.local values.',
    'auth/invalid-api-key':
      'Sign-in is not configured yet. Check your .env.local values.',
    'auth/configuration-not-found':
      'Email and password sign-in is not enabled yet.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/missing-password': 'Enter your password.',
    'auth/network-request-failed':
      'Unable to connect. Check your internet connection.',
    'auth/operation-not-allowed':
      'Email and password sign-in is not enabled yet.',
    'auth/too-many-requests':
      'Too many attempts. Please wait and try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account was found for this email.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'firestore/permission-denied':
      'We could not access your profile right now. Please try again.',
    'firestore/unavailable':
      'The profile service is temporarily unavailable. Try again.',
  };

  return (
    messages[error.code] ??
    'Authentication failed. Check your details and try again.'
  );
}
