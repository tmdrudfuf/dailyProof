export type CheckInResult = 'approved';

export type CheckIn = {
  id: string;
  goalId: string;
  userId: string;
  photoUrl: string;
  aiConfidence: number;
  aiResult: CheckInResult;
  createdAt: string;
};
