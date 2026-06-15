import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Goal } from '../types/goal';
import { readStoredJson, storageKeys, writeStoredJson } from './storage';

const REMINDER_CHANNEL_ID = 'dailyproof-reminders';

type ReminderNotificationMap = Record<string, string>;

type NotificationPermissionResult = {
  granted: boolean;
  message?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getReminderMap() {
  return readStoredJson<ReminderNotificationMap>(
    storageKeys.goalReminderNotifications,
    {}
  );
}

async function saveReminderMap(reminderMap: ReminderNotificationMap) {
  await writeStoredJson(storageKeys.goalReminderNotifications, reminderMap);
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'DailyProof Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function parseReminderTime(reminderTime: string) {
  const match = reminderTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const [, hourValue, minuteValue, meridiemValue] = match;
  const minute = Number(minuteValue);
  let hour = Number(hourValue);

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  const meridiem = meridiemValue.toUpperCase();
  if (meridiem === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionResult> {
  if (Platform.OS === 'web') {
    return {
      granted: false,
      message: 'Goal reminders are available on iOS and Android devices.',
    };
  }

  await ensureAndroidChannel();

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (finalStatus !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    return {
      granted: false,
      message:
        'Notification permission was denied. Goal reminders will not be scheduled.',
    };
  }

  return { granted: true };
}

export async function cancelGoalReminder(goalId: string): Promise<void> {
  const reminderMap = await getReminderMap();
  const notificationId = reminderMap[goalId];

  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  const updatedMap = { ...reminderMap };
  delete updatedMap[goalId];
  await saveReminderMap(updatedMap);
}

export async function scheduleGoalReminder(goal: Goal): Promise<string | null> {
  await cancelGoalReminder(goal.id);

  if (!goal.isActive || !goal.reminderTime.trim()) {
    return null;
  }

  const reminderTime = parseReminderTime(goal.reminderTime);
  if (!reminderTime) {
    throw new Error(
      `Reminder time "${goal.reminderTime}" could not be scheduled. Use a time like 9:00 AM.`
    );
  }

  const permission = await requestNotificationPermissions();
  if (!permission.granted) {
    throw new Error(permission.message);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'DailyProof Reminder',
      body: `Don't forget to prove your goal: ${goal.title}`,
      data: {
        goalId: goal.id,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminderTime.hour,
      minute: reminderTime.minute,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  const reminderMap = await getReminderMap();
  await saveReminderMap({
    ...reminderMap,
    [goal.id]: notificationId,
  });

  return notificationId;
}

export async function rescheduleGoalReminder(goal: Goal): Promise<string | null> {
  await cancelGoalReminder(goal.id);

  if (!goal.isActive) {
    return null;
  }

  return scheduleGoalReminder(goal);
}

export async function scheduleAllGoalReminders(goals: Goal[]): Promise<void> {
  for (const goal of goals) {
    if (goal.isActive && goal.reminderTime.trim()) {
      await rescheduleGoalReminder(goal);
    } else {
      await cancelGoalReminder(goal.id);
    }
  }
}
