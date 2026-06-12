import { CheckInResult } from '../types/checkIn';
import { GoalCategory } from '../types/goal';

export type VerificationResult = {
  aiConfidence: number;
  aiResult: CheckInResult;
  aiFeedback: string;
};

const categoryFeedback: Record<GoalCategory, string> = {
  Exercise: 'Your photo supports your exercise goal. Keep showing up.',
  Study: 'Your study proof looks consistent with the goal you selected.',
  Reading: 'Your reading check-in looks on track. Keep turning the pages.',
  Diet: 'Your photo supports your nutrition goal. Keep making intentional choices.',
  Meditation: 'Your check-in supports your meditation practice. Stay consistent.',
  Spiritual: 'Your proof supports the spiritual practice you committed to.',
  Hobby: 'Your photo shows time invested in your hobby. Keep creating.',
  Work: 'Your check-in supports the work goal you selected. Keep the momentum.',
  Other: 'Your photo supports the promise you made today.',
};

export async function verifyCheckInPhoto(
  photoUri: string,
  goalCategory: GoalCategory,
  goalTitle: string,
): Promise<VerificationResult> {
  // This boundary will be replaced by real verification later.
  void photoUri;

  return {
    aiConfidence: Math.floor(Math.random() * 21) + 75,
    aiResult: 'approved',
    aiFeedback: `${categoryFeedback[goalCategory]} Goal: ${goalTitle}.`,
  };
}
