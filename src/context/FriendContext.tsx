import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  addComment as addStoredComment,
  subscribeToPostComments,
} from '../services/commentService';
import {
  acceptFriendRequest as acceptStoredFriendRequest,
  declineFriendRequest as declineStoredFriendRequest,
  getFeedItems,
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  removeFriend as removeStoredFriend,
  searchUsers as searchStoredUsers,
  sendFriendRequest as sendStoredFriendRequest,
} from '../services/friendService';
import {
  addReaction,
  removeReaction,
  subscribeToPostReactions,
} from '../services/reactionService';
import { FeedPost } from '../types/feed';
import {
  Friend,
  FriendComment,
  FriendReaction,
  FriendReactions,
  FriendRequest,
  ReactionEmoji,
} from '../types/friend';
import { UserProfile } from '../types/user';
import { useAuth } from './AuthContext';

type FriendContextValue = {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  searchResults: Friend[];
  friendFeedItems: FeedPost[];
  reactions: FriendReactions;
  friendReactionsByPost: Record<string, FriendReaction[]>;
  friendCommentsByPost: Record<string, FriendComment[]>;
  isLoading: boolean;
  isSearching: boolean;
  actionUserId: string;
  error: string;
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (receiverId: string) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: string) => Promise<boolean>;
  declineFriendRequest: (friendshipId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  refreshFriends: () => Promise<void>;
  watchPostActivity: (postIds: string[]) => () => void;
  toggleReaction: (postId: string, reaction: ReactionEmoji) => void;
  addComment: (
    postId: string,
    message: string,
    parentCommentId?: string
  ) => Promise<void>;
};

const FriendContext = createContext<FriendContextValue | undefined>(undefined);

function getFriendErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message.includes('already friends') ||
      error.message.includes('already exists') ||
      error.message.includes('yourself')
    ) {
      return error.message;
    }

    if (error.message.includes('permission-denied')) {
      return 'Friend activity could not be saved right now. Please try again.';
    }

    if (error.message.includes('unavailable')) {
      return 'Friends are temporarily unavailable. Check your connection.';
    }
  }

  return 'Something went wrong with friends. Please try again.';
}

function getCurrentProfile(
  firebaseUserId: string,
  profile: UserProfile | null
): UserProfile {
  return (
    profile ?? {
      uid: firebaseUserId,
      displayName: 'You',
      username: '@you',
      email: '',
      currentStreak: 0,
      createdAt: new Date().toISOString(),
    }
  );
}

export function FriendProvider({ children }: PropsWithChildren) {
  const { firebaseUser, profile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [friendFeedItems, setFriendFeedItems] = useState<FeedPost[]>([]);
  const [reactions, setReactions] = useState<FriendReactions>({});
  const [friendReactionsByPost, setFriendReactionsByPost] = useState<
    Record<string, FriendReaction[]>
  >({});
  const [friendCommentsByPost, setFriendCommentsByPost] = useState<
    Record<string, FriendComment[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [actionUserId, setActionUserId] = useState('');
  const [error, setError] = useState('');
  const loadRequestId = useRef(0);

  const loadFriendState = useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;

    if (!firebaseUser) {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setSearchResults([]);
      setFriendFeedItems([]);
      setReactions({});
      setFriendReactionsByPost({});
      setFriendCommentsByPost({});
      setError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [
        savedFriends,
        savedIncomingRequests,
        savedOutgoingRequests,
        savedFeedItems,
      ] = await Promise.all([
        getFriends(firebaseUser.uid),
        getIncomingFriendRequests(firebaseUser.uid),
        getOutgoingFriendRequests(firebaseUser.uid),
        getFeedItems(firebaseUser.uid),
      ]);

      if (loadRequestId.current === requestId) {
        setFriends(savedFriends);
        setIncomingRequests(savedIncomingRequests);
        setOutgoingRequests(savedOutgoingRequests);
        setFriendFeedItems(savedFeedItems);
      }
    } catch (loadError) {
      if (loadRequestId.current === requestId) {
        setError(getFriendErrorMessage(loadError));
      }
    } finally {
      if (loadRequestId.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [firebaseUser]);

  useEffect(() => {
    void loadFriendState();

    return () => {
      loadRequestId.current += 1;
    };
  }, [loadFriendState]);

  const refreshFriends = useCallback(async () => {
    await loadFriendState();
  }, [loadFriendState]);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!firebaseUser || !query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError('');

      try {
        setSearchResults(await searchStoredUsers(query, firebaseUser.uid));
      } catch (searchError) {
        setSearchResults([]);
        setError(getFriendErrorMessage(searchError));
      } finally {
        setIsSearching(false);
      }
    },
    [firebaseUser]
  );

  const runFriendAction = useCallback(
    async (userId: string, action: () => Promise<void>) => {
      setActionUserId(userId);
      setError('');

      try {
        await action();
        await loadFriendState();
        return true;
      } catch (actionError) {
        setError(getFriendErrorMessage(actionError));
        return false;
      } finally {
        setActionUserId('');
      }
    },
    [loadFriendState]
  );

  const watchPostActivity = useCallback(
    (postIds: string[]) => {
      const uniquePostIds = [...new Set(postIds)];
      const unsubscribeReactions = subscribeToPostReactions(
        uniquePostIds,
        (reactionsByPost) => {
          setFriendReactionsByPost(reactionsByPost);

          if (!firebaseUser) {
            setReactions({});
            return;
          }

          const selectedReactions: FriendReactions = {};
          Object.entries(reactionsByPost).forEach(([postId, postReactions]) => {
            selectedReactions[postId] = postReactions
              .filter((reaction) => reaction.friendId === firebaseUser.uid)
              .map((reaction) => reaction.reaction);
          });
          setReactions(selectedReactions);
        },
        (reactionError) => {
          setError(getFriendErrorMessage(reactionError));
        }
      );
      const unsubscribeComments = subscribeToPostComments(
        uniquePostIds,
        setFriendCommentsByPost,
        (commentError) => {
          setError(getFriendErrorMessage(commentError));
        }
      );

      return () => {
        unsubscribeReactions();
        unsubscribeComments();
      };
    },
    [firebaseUser]
  );

  const toggleReaction = useCallback(
    (postId: string, reaction: ReactionEmoji) => {
      if (!firebaseUser) {
        return;
      }

      const currentProfile = getCurrentProfile(firebaseUser.uid, profile);
      const selectedPostReactions = reactions[postId] ?? [];
      const isSelected = selectedPostReactions.includes(reaction);

      setReactions((current) => ({
        ...current,
        [postId]: isSelected
          ? selectedPostReactions.filter((item) => item !== reaction)
          : [...selectedPostReactions, reaction],
      }));

      void (isSelected
        ? removeReaction(postId, reaction, firebaseUser.uid)
        : addReaction(postId, reaction, currentProfile));
    },
    [firebaseUser, profile, reactions]
  );

  const addComment = useCallback(
    async (postId: string, message: string, parentCommentId?: string) => {
      if (!firebaseUser || !message.trim()) {
        return;
      }

      try {
        await addStoredComment(
          postId,
          message,
          getCurrentProfile(firebaseUser.uid, profile),
          parentCommentId
        );
      } catch (commentError) {
        setError(getFriendErrorMessage(commentError));
      }
    },
    [firebaseUser, profile]
  );

  const value = useMemo<FriendContextValue>(
    () => ({
      friends,
      incomingRequests,
      outgoingRequests,
      searchResults,
      friendFeedItems,
      reactions,
      friendReactionsByPost,
      friendCommentsByPost,
      isLoading,
      isSearching,
      actionUserId,
      error,
      searchUsers,
      sendFriendRequest: async (receiverId) => {
        if (!firebaseUser) {
          return false;
        }

        return runFriendAction(receiverId, async () => {
          await sendStoredFriendRequest(firebaseUser.uid, receiverId);
        });
      },
      acceptFriendRequest: async (friendshipId) => {
        return runFriendAction(friendshipId, async () => {
          await acceptStoredFriendRequest(friendshipId);
        });
      },
      declineFriendRequest: async (friendshipId) => {
        return runFriendAction(friendshipId, async () => {
          await declineStoredFriendRequest(friendshipId);
        });
      },
      removeFriend: async (friendshipId) => {
        return runFriendAction(friendshipId, async () => {
          await removeStoredFriend(friendshipId);
        });
      },
      refreshFriends,
      watchPostActivity,
      toggleReaction,
      addComment,
    }),
    [
      friends,
      incomingRequests,
      outgoingRequests,
      searchResults,
      friendFeedItems,
      reactions,
      friendReactionsByPost,
      friendCommentsByPost,
      isLoading,
      isSearching,
      actionUserId,
      error,
      searchUsers,
      firebaseUser,
      runFriendAction,
      refreshFriends,
      watchPostActivity,
      toggleReaction,
      addComment,
    ]
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
