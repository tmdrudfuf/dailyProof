import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getFeedItems,
  getFriendRequests,
  getFriends,
} from '../services/friendService';
import {
  addReaction,
  getReactions,
  removeReaction,
} from '../services/reactionService';
import { FeedPost } from '../types/feed';
import {
  Friend,
  FriendReactions,
  ReactionEmoji,
} from '../types/friend';

type FriendContextValue = {
  friends: Friend[];
  friendRequests: Friend[];
  friendFeedItems: FeedPost[];
  reactions: FriendReactions;
  toggleReaction: (postId: string, reaction: ReactionEmoji) => void;
};

const FriendContext = createContext<FriendContextValue | undefined>(undefined);

export function FriendProvider({ children }: PropsWithChildren) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [friendFeedItems, setFriendFeedItems] = useState<FeedPost[]>([]);
  const [reactions, setReactions] = useState<FriendReactions>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restoreFriendState() {
      const [
        savedFriends,
        savedFriendRequests,
        savedFeedItems,
        savedReactions,
      ] = await Promise.all([
        getFriends(),
        getFriendRequests(),
        getFeedItems(),
        getReactions(),
      ]);

      if (isMounted) {
        setFriends(savedFriends);
        setFriendRequests(savedFriendRequests);
        setFriendFeedItems(savedFeedItems);
        setReactions(savedReactions);
        setIsHydrated(true);
      }
    }

    void restoreFriendState();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<FriendContextValue>(
    () => ({
      friends,
      friendRequests,
      friendFeedItems,
      reactions,
      toggleReaction: (postId, reaction) => {
        setReactions((current) => {
          const postReactions = current[postId] ?? [];
          const isSelected = postReactions.includes(reaction);

          void (isSelected
            ? removeReaction(postId, reaction)
            : addReaction(postId, reaction));

          return {
            ...current,
            [postId]: isSelected
              ? postReactions.filter((item) => item !== reaction)
              : [...postReactions, reaction],
          };
        });
      },
    }),
    [friendFeedItems, friendRequests, friends, reactions]
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <FriendContext.Provider value={value}>{children}</FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);

  if (!context) {
    throw new Error('useFriends must be used within a FriendProvider.');
  }

  return context;
}
