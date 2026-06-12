import { FeedPost } from '../types/feed';
import {
  Friend,
  FriendComment,
  FriendReaction,
} from '../types/friend';

export const mockFriends: Friend[] = [
  {
    id: 'friend-emma',
    displayName: 'Emma',
    username: '@emma.moves',
    profileImage: 'mock://profiles/emma',
    currentStreak: 12,
  },
  {
    id: 'friend-tom',
    displayName: 'Tom',
    username: '@tom.builds',
    profileImage: 'mock://profiles/tom',
    currentStreak: 8,
  },
  {
    id: 'friend-sarah',
    displayName: 'Sarah',
    username: '@sarah.reads',
    profileImage: 'mock://profiles/sarah',
    currentStreak: 21,
  },
];

export const mockFriendRequests: Friend[] = [
  {
    id: 'request-lina',
    displayName: 'Lina',
    username: '@lina.focus',
    profileImage: 'mock://profiles/lina',
    currentStreak: 5,
  },
  {
    id: 'request-noah',
    displayName: 'Noah',
    username: '@noah.daily',
    profileImage: 'mock://profiles/noah',
    currentStreak: 3,
  },
];

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const getMockFriendCheckIns = (): FeedPost[] => [
  {
    id: 'friend-checkin-emma',
    friendId: 'friend-emma',
    friendName: 'Emma',
    initials: 'EM',
    goal: 'Morning Workout',
    proof: 'Started the day with a strong workout.',
    timeAgo: '15 min ago',
    streak: 12,
    reactions: 4,
    visual: 'run',
    categoryEmoji: '💪',
    isCheckIn: true,
    createdAt: minutesAgo(15),
  },
  {
    id: 'friend-checkin-tom',
    friendId: 'friend-tom',
    friendName: 'Tom',
    initials: 'TO',
    goal: 'Deep Work Session',
    proof: 'One focused session completed.',
    timeAgo: '48 min ago',
    streak: 8,
    reactions: 2,
    visual: 'build',
    categoryEmoji: '💼',
    isCheckIn: true,
    createdAt: minutesAgo(48),
  },
  {
    id: 'friend-checkin-sarah',
    friendId: 'friend-sarah',
    friendName: 'Sarah',
    initials: 'SA',
    goal: 'Read 20 Pages',
    proof: 'Today’s reading proof is in.',
    timeAgo: '2 hr ago',
    streak: 21,
    reactions: 7,
    visual: 'read',
    categoryEmoji: '📖',
    isCheckIn: true,
    createdAt: minutesAgo(120),
  },
];

export const getMockReactionsForPost = (
  postId: string,
  ownerId?: string
): FriendReaction[] => {
  if (!postId) {
    return [];
  }

  if (ownerId === 'friend-emma') {
    return [
      { friendId: 'local-user', displayName: 'Ky', reaction: '🔥' },
      { friendId: 'friend-tom', displayName: 'Tom', reaction: '👏' },
      { friendId: 'friend-sarah', displayName: 'Sarah', reaction: '💪' },
    ];
  }

  if (ownerId === 'friend-tom') {
    return [
      { friendId: 'local-user', displayName: 'Ky', reaction: '💪' },
      { friendId: 'friend-emma', displayName: 'Emma', reaction: '🎉' },
    ];
  }

  if (ownerId === 'friend-sarah') {
    return [
      { friendId: 'local-user', displayName: 'Ky', reaction: '📚' },
      { friendId: 'friend-emma', displayName: 'Emma', reaction: '👏' },
      { friendId: 'friend-tom', displayName: 'Tom', reaction: '🔥' },
    ];
  }

  return [
    {
      friendId: mockFriends[0].id,
      displayName: mockFriends[0].displayName,
      reaction: '🔥',
    },
    {
      friendId: mockFriends[1].id,
      displayName: mockFriends[1].displayName,
      reaction: '👏',
    },
    {
      friendId: mockFriends[2].id,
      displayName: mockFriends[2].displayName,
      reaction: '💪',
    },
  ];
};

export const getMockCommentsForPost = (
  postId: string,
  ownerId?: string
): FriendComment[] => {
  if (!postId) {
    return [];
  }

  if (ownerId === 'friend-emma') {
    return [
      {
        id: `${postId}-comment-tom`,
        friendId: 'friend-tom',
        displayName: 'Tom',
        message: 'Strong start to the day!',
        createdAt: minutesAgo(9),
      },
      {
        id: `${postId}-comment-sarah`,
        friendId: 'friend-sarah',
        displayName: 'Sarah',
        message: 'Your consistency is inspiring.',
        createdAt: minutesAgo(6),
      },
    ];
  }

  if (ownerId === 'friend-tom') {
    return [
      {
        id: `${postId}-comment-ky`,
        friendId: 'local-user',
        displayName: 'Ky',
        message: 'Nice focus. Keep building!',
        createdAt: minutesAgo(30),
      },
      {
        id: `${postId}-comment-emma`,
        friendId: 'friend-emma',
        displayName: 'Emma',
        message: 'That is a solid session.',
        createdAt: minutesAgo(24),
      },
    ];
  }

  if (ownerId === 'friend-sarah') {
    return [
      {
        id: `${postId}-comment-emma`,
        friendId: 'friend-emma',
        displayName: 'Emma',
        message: 'Adding this book to my list.',
        createdAt: minutesAgo(80),
      },
      {
        id: `${postId}-comment-tom`,
        friendId: 'friend-tom',
        displayName: 'Tom',
        message: 'Twenty pages done. Great work!',
        createdAt: minutesAgo(70),
      },
    ];
  }

  return [
    {
      id: `${postId}-comment-emma`,
      friendId: mockFriends[0].id,
      displayName: mockFriends[0].displayName,
      message: 'You showed up again. Keep going!',
      createdAt: minutesAgo(4),
    },
    {
      id: `${postId}-comment-tom`,
      friendId: mockFriends[1].id,
      displayName: mockFriends[1].displayName,
      message: 'That streak is looking strong.',
      createdAt: minutesAgo(2),
    },
    {
      id: `${postId}-comment-sarah`,
      friendId: mockFriends[2].id,
      displayName: mockFriends[2].displayName,
      message: 'Proud of you for keeping the promise!',
      createdAt: minutesAgo(1),
    },
  ];
};
