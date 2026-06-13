import { FriendReactions, ReactionEmoji } from '../types/friend';
import { readStoredJson, storageKeys, writeStoredJson } from './storage';

let reactionMutationQueue: Promise<FriendReactions> = Promise.resolve({});

export async function getReactions(): Promise<FriendReactions> {
  return readStoredJson<FriendReactions>(storageKeys.friendReactions, {});
}

export async function addReaction(
  postId: string,
  reaction: ReactionEmoji
): Promise<FriendReactions> {
  reactionMutationQueue = reactionMutationQueue.then(async () => {
    const reactions = await getReactions();
    const postReactions = reactions[postId] ?? [];

    if (postReactions.includes(reaction)) {
      return reactions;
    }

    const updatedReactions = {
      ...reactions,
      [postId]: [...postReactions, reaction],
    };

    await writeStoredJson(storageKeys.friendReactions, updatedReactions);
    return updatedReactions;
  });

  return reactionMutationQueue;
}

export async function removeReaction(
  postId: string,
  reaction: ReactionEmoji
): Promise<FriendReactions> {
  reactionMutationQueue = reactionMutationQueue.then(async () => {
    const reactions = await getReactions();
    const updatedReactions = {
      ...reactions,
      [postId]: (reactions[postId] ?? []).filter(
        (item) => item !== reaction
      ),
    };

    await writeStoredJson(storageKeys.friendReactions, updatedReactions);
    return updatedReactions;
  });

  return reactionMutationQueue;
}
