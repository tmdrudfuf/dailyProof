export type Friend = {
  id: string;
  displayName: string;
  username: string;
  profileImage: string;
  currentStreak: number;
};

export const reactionEmojis = ['🔥', '💪', '👏', '📚', '🎉'] as const;

export type ReactionEmoji = (typeof reactionEmojis)[number];

export type FriendReactions = Record<string, ReactionEmoji[]>;

export type FriendReaction = {
  friendId: string;
  displayName: string;
  reaction: ReactionEmoji;
};

export type FriendComment = {
  id: string;
  friendId: string;
  displayName: string;
  message: string;
  createdAt: string;
};
