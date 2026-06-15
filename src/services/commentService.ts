import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { FriendComment } from '../types/friend';
import { UserProfile } from '../types/user';
import { db } from './firebase';

const COMMENTS_COLLECTION = 'comments';

type StoredComment = {
  postId: string;
  userId: string;
  displayName: string;
  username?: string;
  message: string;
  parentCommentId?: string;
  createdAt: string;
};

export function subscribeToPostComments(
  postIds: string[],
  onChange: (commentsByPost: Record<string, FriendComment[]>) => void,
  onError?: (error: Error) => void
) {
  const visiblePostIds = [...new Set(postIds)];

  if (visiblePostIds.length === 0) {
    onChange({});
    return () => undefined;
  }

  const commentsByPost: Record<string, FriendComment[]> = {};
  const unsubscribeList = visiblePostIds.reduce<(() => void)[]>(
    (subscribers, _postId, index) => {
      if (index % 10 !== 0) {
        return subscribers;
      }

      const postIdBatch = visiblePostIds.slice(index, index + 10);
      const commentsQuery = query(
        collection(db, COMMENTS_COLLECTION),
        where('postId', 'in', postIdBatch)
      );

      return [
        ...subscribers,
        onSnapshot(
          commentsQuery,
          (snapshot) => {
            postIdBatch.forEach((postId) => {
              delete commentsByPost[postId];
            });

            snapshot.docs.forEach((commentDocument) => {
              const comment = commentDocument.data() as StoredComment;

              commentsByPost[comment.postId] = [
                ...(commentsByPost[comment.postId] ?? []),
                {
                  id: commentDocument.id,
                  friendId: comment.userId,
                  displayName: comment.displayName,
                  username: comment.username,
                  message: comment.message,
                  parentCommentId: comment.parentCommentId,
                  createdAt: comment.createdAt,
                },
              ];
            });

            Object.keys(commentsByPost).forEach((postId) => {
              commentsByPost[postId].sort(
                (first, second) =>
                  new Date(first.createdAt).getTime() -
                  new Date(second.createdAt).getTime()
              );
            });

            onChange({ ...commentsByPost });
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

export async function addComment(
  postId: string,
  message: string,
  profile: UserProfile,
  parentCommentId?: string
): Promise<void> {
  await addDoc(collection(db, COMMENTS_COLLECTION), {
    postId,
    userId: profile.uid,
    displayName: profile.displayName,
    username: profile.username,
    message: message.trim(),
    ...(parentCommentId ? { parentCommentId } : {}),
    createdAt: new Date().toISOString(),
  });
}
