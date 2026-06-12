import { Goal } from '../types/goal';

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    category: 'Exercise',
    categoryEmoji: '💪',
    title: 'Move for 30 minutes',
    startDate: '2026-06-09',
    endDate: '2026-07-08',
    successTarget: 24,
    completedDays: 3,
    reminderTime: '7:00 AM',
    visibility: 'Friends',
    isActive: true,
    createdAt: '2026-06-09T08:00:00.000Z',
  },
];
