import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { CheckIn } from '../types/checkIn';
import { FeedPost } from '../types/feed';
import {
  Friend,
  FriendRequest,
  Friendship,
} from '../types/friend';
import { Goal, GoalCategory } from '../types/goal';
import { User } from '../types/user';
import { auth, db } from './firebase';

const USERS_COLLECTION = 'users';
const FRIENDSHIPS_COLLECTION = 'friendships';
const GOALS_COLLECTION = 'goals';
const CHECK_INS_COLLECTION = 'checkIns';

function getFriendshipId(firstUserId: string, secondUserId: string) {
  return [firstUserId, secondUserId].sort().join('_');
}

function toFriend(profile: User, friendshipId: string): Friend {
  return {
    id: profile.uid,
    friendshipId,
    displayName: profile.displayName,
    username: profile.username,
    profileImage: '',
    currentStreak: profile.currentStreak,
  };
}

async function getProfiles(userIds: string[]) {
  const snapshots = await Promise.all(
    [...new Set(userIds)].map((userId) =>
      getDoc(doc(db, USERS_COLLECTION, userId))
    )
  );

  return new Map(
    snapshots
      .filter((snapshot) => snapshot.exists())
      .map((snapshot) => [
        snapshot.id,
        { ...(snapshot.data() as User), uid: snapshot.id },
      ])
  );
}

async function getFriendshipsForUser(userId: string) {
  const [requestedSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, FRIENDSHIPS_COLLECTION),
        where('requesterId', '==', userId)
      )
    ),
    getDocs(
      query(
        collection(db, FRIENDSHIPS_COLLECTION),
        where('receiverId', '==', userId)
      )
    ),
  ]);
  const friendships = [
    ...requestedSnapshot.docs,
    ...receivedSnapshot.docs,
  ].map((snapshot) => ({
    ...(snapshot.data() as Omit<Friendship, 'id'>),
    id: snapshot.id,
  }));

  return [...new Map(friendships.map((item) => [item.id, item])).values()];
}

export async function searchUsers(
  searchQuery: string,
  currentUserId: string
): Promise<Friend[]> {
  const normalizedQuery = searchQuery.trim().toLowerCase().replace(/^@/, '');

  if (!normalizedQuery) {
    return [];
  }

  const snapshot = await getDocs(collection(db, USERS_COLLECTION));
  return snapshot.docs
    .map((userDocument) => ({
      ...(userDocument.data() as User),
      uid: userDocument.id,
    }))
    .filter(
      (user) =>
        user.uid !== currentUserId &&
        (user.displayName.toLowerCase().includes(normalizedQuery) ||
          user.username
            .toLowerCase()
            .replace(/^@/, '')
            .includes(normalizedQuery))
    )
    .slice(0, 20)
    .map((user) =>
      toFriend(user, getFriendshipId(currentUserId, user.uid))
    );
}

export async function sendFriendRequest(
  requesterId: string,
  receiverId: string
): Promise<Friendship> {
  if (auth.currentUser?.uid !== requesterId) {
    throw new Error('You must be logged in to send a friend request.');
  }

  if (requesterId === receiverId) {
    throw new Error('You cannot send a friend request to yourself.');
  }

  const friendshipId = getFriendshipId(requesterId, receiverId);
  const reference = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  const existingSnapshot = await getDoc(reference);

  if (existingSnapshot.exists()) {
    const existingFriendship = existingSnapshot.data() as Friendship;

    if (existingFriendship.status === 'accepted') {
      throw new Error('You are already friends.');
    }

    throw new Error('A friend request already exists.');
  }

  const now = new Date().toISOString();
  const friendship: Friendship = {
    id: friendshipId,
    requesterId,
    receiverId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(reference, friendship);
  return friendship;
}

export async function getIncomingFriendRequests(
  userId: string
): Promise<FriendRequest[]> {
  const friendships = (await getFriendshipsForUser(userId)).filter(
    (item) => item.receiverId === userId && item.status === 'pending'
  );
  const profiles = await getProfiles(
    friendships.map((item) => item.requesterId)
  );

  return friendships.flatMap((friendship) => {
    const profile = profiles.get(friendship.requesterId);
    return profile
      ? [{ friendship, user: toFriend(profile, friendship.id) }]
      : [];
  });
}

export async function getOutgoingFriendRequests(
  userId: string
): Promise<FriendRequest[]> {
  const friendships = (await getFriendshipsForUser(userId)).filter(
    (item) => item.requesterId === userId && item.status === 'pending'
  );
  const profiles = await getProfiles(
    friendships.map((item) => item.receiverId)
  );

  return friendships.flatMap((friendship) => {
    const profile = profiles.get(friendship.receiverId);
    return profile
      ? [{ friendship, user: toFriend(profile, friendship.id) }]
      : [];
  });
}

export async function acceptFriendRequest(
  friendshipId: string
): Promise<void> {
  const reference = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  const snapshot = await getDoc(reference);
  const friendship = snapshot.data() as Friendship | undefined;

  if (
    !friendship ||
    friendship.receiverId !== auth.currentUser?.uid ||
    friendship.status !== 'pending'
  ) {
    throw new Error('This friend request cannot be accepted.');
  }

  await updateDoc(reference, {
    status: 'accepted',
    updatedAt: new Date().toISOString(),
  });
}

export async function declineFriendRequest(
  friendshipId: string
): Promise<void> {
  const reference = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  const snapshot = await getDoc(reference);
  const friendship = snapshot.data() as Friendship | undefined;

  if (
    !friendship ||
    friendship.receiverId !== auth.currentUser?.uid ||
    friendship.status !== 'pending'
  ) {
    throw new Error('This friend request cannot be declined.');
  }

  await deleteDoc(reference);
}

export async function getFriends(userId: string): Promise<Friend[]> {
  const friendships = (await getFriendshipsForUser(userId)).filter(
    (item) => item.status === 'accepted'
  );
  const friendIds = friendships.map((item) =>
    item.requesterId === userId ? item.receiverId : item.requesterId
  );
  const profiles = await getProfiles(friendIds);

  return friendships.flatMap((friendship) => {
    const friendId =
      friendship.requesterId === userId
        ? friendship.receiverId
        : friendship.requesterId;
    const profile = profiles.get(friendId);
    return profile ? [toFriend(profile, friendship.id)] : [];
  });
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const reference = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  const snapshot = await getDoc(reference);
  const friendship = snapshot.data() as Friendship | undefined;
  const currentUserId = auth.currentUser?.uid;

  if (
    !friendship ||
    friendship.status !== 'accepted' ||
    (friendship.requesterId !== currentUserId &&
      friendship.receiverId !== currentUserId)
  ) {
    throw new Error('This friendship cannot be removed.');
  }

  await deleteDoc(reference);
}

function getVisual(category: GoalCategory): FeedPost['visual'] {
  if (category === 'Exercise') {
    return 'run';
  }

  if (category === 'Reading') {
    return 'read';
  }

  return 'build';
}

function getInitials(displayName: string) {
  return (
    displayName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DP'
  );
}

async function getVisibleGoals(userId: string): Promise<Goal[]> {
  const [friendsGoalsSnapshot, publicGoalsSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, GOALS_COLLECTION),
        where('userId', '==', userId),
        where('visibility', '==', 'Friends')
      )
    ),
    getDocs(
      query(
        collection(db, GOALS_COLLECTION),
        where('userId', '==', userId),
        where('visibility', '==', 'Public')
      )
    ),
  ]);

  return [...friendsGoalsSnapshot.docs, ...publicGoalsSnapshot.docs]
    .map((snapshot) => ({
      ...(snapshot.data() as Omit<Goal, 'id'>),
      id: snapshot.id,
    }))
    .filter((goal) => goal.visibility === 'Friends' || goal.visibility === 'Public');
}

async function getGoalCheckIns(goalId: string): Promise<CheckIn[]> {
  const snapshot = await getDocs(
    query(
      collection(db, CHECK_INS_COLLECTION),
      where('goalId', '==', goalId)
    )
  );

  return snapshot.docs.map((checkInDocument) => ({
    ...(checkInDocument.data() as Omit<CheckIn, 'id'>),
    id: checkInDocument.id,
  }));
}

export async function getFeedItems(userId: string): Promise<FeedPost[]> {
  if (!userId) {
    return [];
  }

  const friends = await getFriends(userId);
  const postGroups = await Promise.all(
    friends.map(async (friend) => {
      const goals = await getVisibleGoals(friend.id);
      const goalCheckIns = await Promise.all(
        goals.map(async (goal) => ({
          goal,
          checkIns: await getGoalCheckIns(goal.id),
        }))
      );

      return goalCheckIns.flatMap(({ goal, checkIns }) =>
        checkIns
          .filter(
            (checkIn) =>
              checkIn.goalId === goal.id &&
              checkIn.userId === friend.id &&
              Boolean(checkIn.photoUrl)
          )
          .map((checkIn) => ({
          id: checkIn.id,
          friendId: friend.id,
          friendName: friend.displayName,
          initials: getInitials(friend.displayName),
          goal: checkIn.goalTitle,
          proof: "Checked in and kept today's promise.",
          timeAgo: 'Just now',
          streak: friend.currentStreak,
          reactions: 0,
          visual: getVisual(checkIn.category),
          categoryEmoji: checkIn.categoryEmoji,
          photoUrl: checkIn.photoUrl,
          isCheckIn: true,
          createdAt: checkIn.createdAt,
        } satisfies FeedPost))
      );
    })
  );

  return postGroups
    .flat()
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    );
}
