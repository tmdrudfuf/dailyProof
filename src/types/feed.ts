export type FeedPost = {
  id: string;
  friendId?: string;
  friendName: string;
  initials: string;
  goal: string;
  proof: string;
  timeAgo: string;
  streak: number;
  reactions: number;
  visual: 'run' | 'build' | 'read';
  categoryEmoji?: string;
  photoUrl?: string;
  isCheckIn?: boolean;
  createdAt?: string;
};
