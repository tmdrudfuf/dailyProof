export type CheckInResult = 'approved' | 'warning' | 'rejected';

export type CheckIn = {
  id: string;
  goalId: string;
  userId: string;
  photoUrl: string;
  aiConfidence: number;
  aiResult: CheckInResult;
  aiFeedback: string;
  createdAt: string;
};
