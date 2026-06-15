import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import {
  FriendReaction,
  ReactionEmoji,
} from '../types/friend';
import { UserProfile } from '../types/user';
import { db } from './firebase';

const REACTIONS_COLLECTION = 'reactions';

type StoredReaction = {
  id: string;
  postId: string;
  userId: string;
  displayName: string;
  username?: string;
  reaction: ReactionEmoji;
  createdAt: string;
};

function getReactionKey(reaction: ReactionEmoji) {
  return Array.from(reaction)
    .map((part) => part.codePointAt(0)?.toString(16) ?? '')
    .join('-');
}

function getReactionDocId(
  postId: string,
  userId: string,
  reaction: ReactionEmoji
) {
  return `${postId}_${userId}_${getReactionKey(reaction)}`;
}

export function subscribeToPostReactions(
  postIds: string[],
  onChange: (reactionsByPost: Record<string, FriendReaction[]>) => void,
  onError?: (error: Error) => void
) {
  const visiblePostIds = [...new Set(postIds)];

  if (visiblePostIds.length === 0) {
    onChange({});
    return () => undefined;
  }

  const reactionsByPost: Record<string, FriendReaction[]> = {};
  const unsubscribeList = visiblePostIds.reduce<(() => void)[]>(
    (subscribers, _postId, index) => {
      if (index % 10 !== 0) {
        return subscribers;
      }

      const postIdBatch = visiblePostIds.slice(index, index + 10);
      const reactionsQuery = query(
        collection(db, REACTIONS_COLLECTION),
        where('postId', 'in', postIdBatch)
      );

      return [
        ...subscribers,
        onSnapshot(
          reactionsQuery,
          (snapshot) => {
            postIdBatch.forEach((postId) => {
              delete reactionsByPost[postId];
            });

            snapshot.docs.forEach((reactionDocument) => {
              const reaction = {
                ...(reactionDocument.data() as Omit<StoredReaction, 'id'>),
                id: reactionDocument.id,
              };

              reactionsByPost[reaction.postId] = [
                ...(reactionsByPost[reaction.postId] ?? []),
                {
                  friendId: reaction.userId,
                  displayName: reaction.displayName,
                  username: reaction.username,
                  reaction: reaction.reaction,
                },
              ];
            });

            onChange({ ...reactionsByPost });
          },
          (error) => {
            onError?.(error);
          }
        ),
      ];
    },
    []
  );

  return () => {
    unsubscribeList.forEach((unsubscribe) => unsubscribe());
  };
}

export async function addReaction(
  postId: string,
  reaction: ReactionEmoji,
  profile: UserProfile
): Promise<void> {
  const reactionId = getReactionDocId(postId, profile.uid, reaction);

  await setDoc(doc(db, REACTIONS_COLLECTION, reactionId), {
    id: reactionId,
    postId,
    userId: profile.uid,
    displayName: profile.displayName,
    username: profile.username,
    reaction,
    createdAt: new Date().toISOString(),
  });
}

export async function removeReaction(
  postId: string,
  reaction: ReactionEmoji,
  userId: string
): Promise<void> {
  await deleteDoc(
    doc(db, REACTIONS_COLLECTION, getReactionDocId(postId, userId, reaction))
  );
}
