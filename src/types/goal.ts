export type GoalVisibility = 'Friends' | 'Private' | 'Public';

export type GoalCategory =
  | 'Exercise'
  | 'Study'
  | 'Reading'
  | 'Diet'
  | 'Meditation'
  | 'Spiritual'
  | 'Hobby'
  | 'Work'
  | 'Other';

export type Goal = {
  id: string;
  userId: string;
  category: GoalCategory;
  categoryEmoji: string;
  title: string;
  startDate: string;
  endDate: string;
  successTarget: number;
  completedDays: number;
  reminderTime: string;
  visibility: GoalVisibility;
  isActive: boolean;
  createdAt: string;
};

export type NewGoal = Omit<
  Goal,
  'id' | 'userId' | 'completedDays' | 'isActive' | 'createdAt'
>;

export type GoalUpdates = Partial<
  Omit<Goal, 'id' | 'userId' | 'createdAt'>
>;
