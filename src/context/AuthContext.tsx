import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User } from 'firebase/auth';

import {
  loadUserProfile,
  signIn,
  signOut,
  signUp,
  subscribeToAuthState,
} from '../services/authService';
import { UserProfile } from '../types/user';

type AuthContextValue = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    displayName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!isMounted) {
        return;
      }

      setFirebaseUser(user);

      if (user) {
        try {
          const userProfile = await loadUserProfile(user);
          if (isMounted) {
            setProfile(userProfile);
          }
        } catch (profileError) {
          console.warn('[AuthContext] Failed to load user profile.', profileError);
          if (isMounted) {
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      isLoading,
      login: async (email, password) => {
        setProfile(await signIn(email, password));
      },
      signup: async (displayName, email, password) => {
        setProfile(await signUp(displayName, email, password));
      },
      logout: signOut,
    }),
    [firebaseUser, isLoading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
