import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  mockFriendRequests,
  mockFriends,
} from '../services/friendService';
import {
  readStoredJson,
  storageKeys,
  writeStoredJson,
} from '../services/storage';
import {
  Friend,
  FriendReactions,
  ReactionEmoji,
} from '../types/friend';

type FriendContextValue = {
  friends: Friend[];
  friendRequests: Friend[];
  reactions: FriendReactions;
  toggleReaction: (postId: string, reaction: ReactionEmoji) => void;
};

const FriendContext = createContext<FriendContextValue | undefined>(undefined);

export function FriendProvider({ children }: PropsWithChildren) {
  const [reactions, setReactions] = useState<FriendReactions>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function restoreReactions() {
      const savedReactions = await readStoredJson<FriendReactions>(
        storageKeys.friendReactions,
        {}
      );

      setReactions(savedReactions);

      setIsHydrated(true);
    }

    void restoreReactions();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void writeStoredJson(storageKeys.friendReactions, reactions);
    }
  }, [isHydrated, reactions]);

  const value = useMemo<FriendContextValue>(
    () => ({
      friends: mockFriends,
      friendRequests: mockFriendRequests,
      reactions,
      toggleReaction: (postId, reaction) => {
        setReactions((current) => {
          const postReactions = current[postId] ?? [];
          const isSelected = postReactions.includes(reaction);

          return {
            ...current,
            [postId]: isSelected
              ? postReactions.filter((item) => item !== reaction)
              : [...postReactions, reaction],
          };
        });
      },
    }),
    [reactions]
  );

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
