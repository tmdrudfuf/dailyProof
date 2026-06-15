import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  goals: '@dailyproof/goals',
  checkInState: '@dailyproof/check-in-state',
  friendReactions: '@dailyproof/friend-reactions',
  goalReminderNotifications: '@dailyproof/goal-reminder-notifications',
} as const;

export async function readStoredJson<T>(
  key: string,
  fallback: T,
): Promise<T> {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeStoredJson<T>(key: string, value: T) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence failures should not block the local MVP.
  }
}
