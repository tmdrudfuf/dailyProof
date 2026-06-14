import { GoalCategory } from './goal';

export type CheckInResult = 'approved' | 'warning' | 'rejected';

export type CheckIn = {
  id: string;
  userId: string;
  goalId: string;
  goalTitle: string;
  category: GoalCategory;
  categoryEmoji: string;
  photoUrl: string;
  aiConfidence: number;
  aiResult: CheckInResult;
  aiFeedback: string;
  createdAt: string;
};

export type NewCheckIn = Omit<CheckIn, 'id' | 'createdAt'>;
