import { CheckIn } from '../types/checkIn';
import { FeedPost } from '../types/feed';
import { Goal } from '../types/goal';
import { readStoredJson, storageKeys, writeStoredJson } from './storage';
import { verifyCheckInPhoto } from './verificationService';

const LOCAL_USER_ID = 'local-user';

type StoredCheckInState = {
  checkIns: CheckIn[];
  checkInFeedPosts: FeedPost[];
};

export type CreateCheckInResult = {
  checkIn: CheckIn;
  feedPost: FeedPost;
  shouldIncrementGoal: boolean;
};

const emptyCheckInState: StoredCheckInState = {
  checkIns: [],
  checkInFeedPosts: [],
};

function normalizeCheckIns(checkIns: CheckIn[]) {
  return checkIns.map((checkIn) => ({
    ...checkIn,
    aiFeedback:
      checkIn.aiFeedback ??
      'Verification completed for this saved check-in.',
  }));
}

function isSameCalendarDay(firstDate: string, secondDate: string) {
  const first = new Date(firstDate);
  const second = new Date(secondDate);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getVisual(goal: Goal): FeedPost['visual'] {
  if (goal.category === 'Exercise') {
    return 'run';
  }

  if (goal.category === 'Reading') {
    return 'read';
  }

  return 'build';
}

async function getCheckInState(): Promise<StoredCheckInState> {
  const state = await readStoredJson<StoredCheckInState>(
    storageKeys.checkInState,
    emptyCheckInState
  );

  return {
    checkIns: Array.isArray(state?.checkIns)
      ? normalizeCheckIns(state.checkIns)
      : [],
    checkInFeedPosts: Array.isArray(state?.checkInFeedPosts)
      ? state.checkInFeedPosts
      : [],
  };
}

export async function getCheckIns(): Promise<CheckIn[]> {
  return (await getCheckInState()).checkIns;
}

export async function getFeedItems(): Promise<FeedPost[]> {
  return (await getCheckInState()).checkInFeedPosts;
}

export async function createCheckIn(
  goal: Goal,
  photoUrl: string
): Promise<CreateCheckInResult> {
  const state = await getCheckInState();
  const createdAt = new Date().toISOString();
  const alreadyCountedToday = state.checkIns.some(
    (checkIn) =>
      checkIn.goalId === goal.id &&
      isSameCalendarDay(checkIn.createdAt, createdAt)
  );
  const verification = await verifyCheckInPhoto(
    photoUrl,
    goal.category,
    goal.title
  );
  const id = `check-in-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

  const checkIn: CheckIn = {
    id,
    goalId: goal.id,
    userId: LOCAL_USER_ID,
    photoUrl,
    ...verification,
    createdAt,
  };

  const feedPost: FeedPost = {
    id,
    friendName: 'Ky',
    initials: 'KY',
    goal: goal.title,
    proof: "Checked in and kept today's promise.",
    timeAgo: 'Just now',
    streak: alreadyCountedToday
      ? goal.completedDays
      : goal.completedDays + 1,
    reactions: 0,
    visual: getVisual(goal),
    categoryEmoji: goal.categoryEmoji,
    photoUrl,
    isCheckIn: true,
    createdAt,
  };

  await writeStoredJson<StoredCheckInState>(storageKeys.checkInState, {
    checkIns: [checkIn, ...state.checkIns],
    checkInFeedPosts: [feedPost, ...state.checkInFeedPosts],
  });

  return {
    checkIn,
    feedPost,
    shouldIncrementGoal:
      verification.aiResult === 'approved' && !alreadyCountedToday,
  };
}
