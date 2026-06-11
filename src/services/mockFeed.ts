import { FeedPost } from '../types/feed';

export const mockFeedPosts: FeedPost[] = [
  {
    id: '1',
    friendName: 'Maya Chen',
    initials: 'MC',
    goal: 'Morning movement',
    proof: 'Finished a 3-mile sunrise run before work.',
    timeAgo: '18 min ago',
    streak: 8,
    reactions: 14,
    visual: 'run',
  },
  {
    id: '2',
    friendName: 'Jordan Lee',
    initials: 'JL',
    goal: 'Build every day',
    proof: 'Shipped the first version of my portfolio contact form.',
    timeAgo: '1 hr ago',
    streak: 21,
    reactions: 9,
    visual: 'build',
  },
  {
    id: '3',
    friendName: 'Sam Rivera',
    initials: 'SR',
    goal: 'Read more',
    proof: 'Read 25 pages and wrote down three useful ideas.',
    timeAgo: '3 hrs ago',
    streak: 5,
    reactions: 12,
    visual: 'read',
  },
];
