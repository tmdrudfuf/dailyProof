export type Friend = {
  id: string;
  friendshipId: string;
  displayName: string;
  username: string;
  profileImage: string;
  currentStreak: number;
};

export type FriendshipStatus = 'pending' | 'accepted';

export type Friendship = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
};

export type FriendRequest = {
  friendship: Friendship;
  user: Friend;
};

export const reactionEmojis = ['🔥', '💪', '👏', '📚', '🎉'] as const;

export type ReactionEmoji = (typeof reactionEmojis)[number];

export type FriendReactions = Record<string, ReactionEmoji[]>;

export type FriendReaction = {
  friendId: string;
  displayName: string;
  username?: string;
  reaction: ReactionEmoji;
};

export type FriendComment = {
  id: string;
  friendId: string;
  displayName: string;
  username?: string;
  message: string;
  parentCommentId?: string;
  createdAt: string;
};
