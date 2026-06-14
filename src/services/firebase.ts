import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Copy these values from:
// Firebase Console -> Project settings -> Your apps -> Web app.
// Put the real values in .env.local. Expo exposes EXPO_PUBLIC_* values to
// client code, so never place service-account keys or other secrets here.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'replace-me',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'replace-me.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'replace-me',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    'replace-me.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'replace-me',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'replace-me',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value.length > 0 && !value.includes('replace-me')
);

// Reuse the initialized app during Expo Fast Refresh.
const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

type ReactNativeAuthModule = typeof FirebaseAuth & {
  getReactNativePersistence: (
    storage: typeof AsyncStorage
  ) => Persistence;
};

function initializeFirebaseAuth() {
  if (Platform.OS === 'web') {
    return FirebaseAuth.getAuth(firebaseApp);
  }

  try {
    const { getReactNativePersistence } =
      FirebaseAuth as ReactNativeAuthModule;

    return FirebaseAuth.initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return FirebaseAuth.getAuth(firebaseApp);
  }
}

export const auth = initializeFirebaseAuth();
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
