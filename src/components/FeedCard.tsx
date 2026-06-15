import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radii } from '../theme';
import { FeedPost } from '../types/feed';
import {
  FriendComment,
  Friend,
  FriendReaction,
  reactionEmojis,
  ReactionEmoji,
} from '../types/friend';
import { ActivityDetailModal } from './ActivityDetailModal';
import { Avatar } from './Avatar';
import { MentionText } from './MentionText';
import {
  getActiveMentionQuery,
  insertMention,
  MentionSuggestions,
} from './MentionSuggestions';

type FeedCardProps = {
  activityDisplayMode?: 'inline' | 'modal';
  post: FeedPost;
  friendComments?: FriendComment[];
  mentionableFriends?: Friend[];
  friendReactions?: FriendReaction[];
  selectedReactions?: ReactionEmoji[];
  onSubmitComment?: (
    message: string,
    parentCommentId?: string
  ) => Promise<void> | void;
  onPressMention?: (friend: Friend) => void;
  onToggleReaction?: (reaction: ReactionEmoji) => void;
};

const visualConfig = {
  run: {
    background: colors.softOrange,
    icon: 'walk-outline' as const,
    label: '03.0 MI',
    tone: 'orange' as const,
  },
  build: {
    background: colors.softBlue,
    icon: 'code-slash-outline' as const,
    label: 'SHIPPED',
    tone: 'blue' as const,
  },
  read: {
    background: colors.softGreen,
    icon: 'book-outline' as const,
    label: '25 PAGES',
    tone: 'lime' as const,
  },
};

export function FeedCard({
  activityDisplayMode = 'modal',
  post,
  friendComments = [],
  mentionableFriends = [],
  friendReactions = [],
  selectedReactions = [],
  onSubmitComment,
  onPressMention,
  onToggleReaction,
}: FeedCardProps) {
  const visual = visualConfig[post.visual];
  const [commentDraft, setCommentDraft] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [activityModal, setActivityModal] = useState<
    'comments' | 'reactions' | null
  >(null);
  const visibleComments = showAllComments
    ? friendComments
    : friendComments.slice(0, 1);
  const topLevelComments = friendComments.filter(
    (comment) => !comment.parentCommentId
  );
  const summaryComment = topLevelComments[0] ?? friendComments[0];
  const visibleReactions: FriendReaction[] = friendReactions;
  const mentionQuery = getActiveMentionQuery(commentDraft);

  const submitComment = async () => {
    const message = commentDraft.trim();

    if (!message) {
      return;
    }

    setCommentDraft('');
    await onSubmitComment?.(message);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar initials={post.initials} tone={visual.tone} />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{post.friendName}</Text>
          <Text style={styles.time}>
            {post.categoryEmoji ? `${post.categoryEmoji} ` : ''}
            {post.goal} | {post.timeAgo}
          </Text>
        </View>
        <Pressable accessibilityLabel="More options" hitSlop={12}>
          <Ionicons color={colors.muted} name="ellipsis-horizontal" size={20} />
        </Pressable>
      </View>

      {post.isCheckIn ? (
        <View style={styles.mockPhoto}>
          {post.photoUrl ? (
            <Image
              accessibilityLabel={`${post.goal} check-in photo`}
              resizeMode="cover"
              source={{ uri: post.photoUrl }}
              style={styles.checkInPhotoImage}
            />
          ) : (
            <>
              <View style={styles.mockSun} />
              <View style={styles.mockGround} />
              <Text style={styles.mockPhotoEmoji}>
                {post.categoryEmoji ?? '✨'}
              </Text>
            </>
          )}
          <View style={styles.mockPhotoBadge}>
            <Text style={styles.mockPhotoBadgeText}>CAPTURED PROOF</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.proofVisual, { backgroundColor: visual.background }]}>
          <Text style={styles.proofMark}>DAILY{'\n'}PROOF</Text>
          <Ionicons color={colors.ink} name={visual.icon} size={72} />
          <View style={styles.visualLabel}>
            <Text style={styles.visualLabelText}>{visual.label}</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <View style={styles.reactionList}>
          {reactionEmojis.map((reaction) => {
            const isSelected = selectedReactions.includes(reaction);

            return (
              <Pressable
                accessibilityLabel={`React with ${reaction}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={reaction}
                onPress={() => onToggleReaction?.(reaction)}
                style={[
                  styles.reactionButton,
                  isSelected && styles.reactionButtonSelected,
                ]}
              >
                <Text style={styles.reactionEmoji}>{reaction}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons color={colors.ink} name="checkmark-circle" size={16} />
          <Text style={styles.verifiedText}>VERIFIED</Text>
        </View>
      </View>

      {friendReactions.length > 0 || friendComments.length > 0 ? (
        <View style={styles.activityVisibility}>
          <Ionicons color={colors.muted} name="people-outline" size={13} />
          <Text style={styles.activityVisibilityText}>
            Friends can see reactions and comments
          </Text>
        </View>
      ) : null}

      {visibleReactions.length > 0 ? (
        <View style={styles.reactionsSection}>
          {!showAllReactions ? (
            <Pressable
              accessibilityLabel={`View all ${visibleReactions.length} reactions`}
              accessibilityRole="button"
              onPress={() => {
                if (activityDisplayMode === 'modal') {
                  setActivityModal('reactions');
                } else {
                  setShowAllReactions(true);
                }
              }}
              style={styles.friendReactionSummary}
            >
              <View style={styles.reactorAvatars}>
                {visibleReactions.slice(0, 3).map((item, index) => (
                  <View
                    key={`${item.friendId}-${item.reaction}`}
                    style={[
                      styles.reactorAvatar,
                      index > 0 && styles.reactorAvatarOverlap,
                    ]}
                  >
                    <Text style={styles.reactorInitial}>
                      {(item.username ?? item.displayName).slice(0, 1)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.friendReactionText}>
                {visibleReactions
                  .slice(0, 2)
                  .map(
                    (item) =>
                      `${item.username ?? item.displayName} ${item.reaction}`
                  )
                  .join(', ')}
                {visibleReactions.length > 2
                  ? ` and ${visibleReactions.length - 2} more reacted`
                  : ' reacted'}
              </Text>
              <Ionicons
                color={colors.muted}
                name="chevron-down"
                size={14}
              />
            </Pressable>
          ) : null}

          {activityDisplayMode === 'inline' && showAllReactions ? (
            <View style={styles.reactionDetails}>
              <Pressable
                accessibilityLabel="Hide all reactions"
                accessibilityRole="button"
                onPress={() => setShowAllReactions(false)}
                style={styles.expandedHeader}
              >
                <Text style={styles.reactionDetailsTitle}>
                  ALL REACTIONS
                </Text>
                <Ionicons
                  color={colors.muted}
                  name="chevron-up"
                  size={14}
                />
              </Pressable>
              {visibleReactions.map((item) => (
                <View
                  key={`${item.friendId}-${item.reaction}-detail`}
                  style={styles.reactionDetailRow}
                >
                  <View style={styles.reactionDetailAvatar}>
                    <Text style={styles.reactorInitial}>
                      {item.displayName.slice(0, 1)}
                    </Text>
                  </View>
                  <Text style={styles.reactionDetailName}>
                    {item.displayName}
                  </Text>
                  <Text style={styles.reactionDetailEmoji}>
                    {item.reaction}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.description}>
        <Text style={styles.friendName}>{post.friendName} </Text>
        {post.proof}
      </Text>

      {friendComments.length > 0 && summaryComment ? (
        <View style={styles.comments}>
          {!showAllComments ? (
            <Pressable
              accessibilityLabel={`View all ${friendComments.length} comments`}
              accessibilityRole="button"
              onPress={() => {
                if (activityDisplayMode === 'modal') {
                  setActivityModal('comments');
                } else {
                  setShowAllComments(true);
                }
              }}
              style={styles.commentSummary}
            >
              <View style={styles.commentSummaryAvatar}>
                <Text style={styles.commentInitial}>
                  {summaryComment.displayName.slice(0, 1)}
                </Text>
              </View>
              <View style={styles.commentSummaryCopy}>
                <Text style={styles.commentSummaryName}>
                  {summaryComment.username ?? summaryComment.displayName}
                </Text>
                <MentionText
                  friends={mentionableFriends}
                  onPressMention={onPressMention}
                  style={styles.commentSummaryMessage}
                  text={summaryComment.message}
                />
              </View>
              <Text style={styles.commentCount}>
                {friendComments.length}
              </Text>
              <Ionicons
                color={colors.muted}
                name="chevron-down"
                size={14}
              />
            </Pressable>
          ) : activityDisplayMode === 'inline' ? (
            <Pressable
              accessibilityLabel="Hide all comments"
              accessibilityRole="button"
              onPress={() => setShowAllComments(false)}
              style={styles.expandedHeader}
            >
              <Text style={styles.reactionDetailsTitle}>ALL COMMENTS</Text>
              <Ionicons
                color={colors.muted}
                name="chevron-up"
                size={14}
              />
            </Pressable>
          ) : null}

          {activityDisplayMode === 'inline' && showAllComments
            ? visibleComments.map((comment) => (
                <View key={comment.id} style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentInitial}>
                      {comment.displayName.slice(0, 1)}
                    </Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentText}>
                      <Text style={styles.commentName}>
                        {comment.username ?? comment.displayName}{' '}
                      </Text>
                      <MentionText
                        friends={mentionableFriends}
                        onPressMention={onPressMention}
                        text={comment.message}
                      />
                    </Text>
                  </View>
                </View>
              ))
            : null}
        </View>
      ) : null}

      {onSubmitComment ? (
        <View style={styles.commentComposerWrapper}>
          {mentionQuery !== null ? (
            <MentionSuggestions
              friends={mentionableFriends}
              query={mentionQuery}
              onSelect={(friend) =>
                setCommentDraft((current) =>
                  insertMention(current, friend.username)
                )
              }
            />
          ) : null}
          <View style={styles.commentComposer}>
            <TextInput
              onChangeText={setCommentDraft}
              placeholder="Add a comment"
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              style={styles.commentInput}
              value={commentDraft}
              onSubmitEditing={() => {
                void submitComment();
              }}
            />
            <Pressable
              accessibilityLabel="Submit comment"
              accessibilityRole="button"
              disabled={!commentDraft.trim()}
              onPress={() => {
                void submitComment();
              }}
              style={[
                styles.commentSubmitButton,
                !commentDraft.trim() && styles.commentSubmitButtonDisabled,
              ]}
            >
              <Ionicons color={colors.ink} name="send" size={16} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {activityDisplayMode === 'modal' ? (
        <ActivityDetailModal
          comments={friendComments}
          mentionableFriends={mentionableFriends}
          mode={activityModal}
          onClose={() => setActivityModal(null)}
          onPressMention={onPressMention}
          onSubmitComment={onSubmitComment}
          reactions={visibleReactions}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 14,
  },
  friendDetails: {
    flex: 1,
    marginLeft: 11,
  },
  friendName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  time: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  proofVisual: {
    alignItems: 'center',
    aspectRatio: 1.16,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  mockPhoto: {
    alignItems: 'center',
    aspectRatio: 1.05,
    backgroundColor: colors.softBlue,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  checkInPhotoImage: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  mockSun: {
    backgroundColor: '#FFE173',
    borderRadius: 45,
    height: 90,
    position: 'absolute',
    right: 34,
    top: 36,
    width: 90,
  },
  mockGround: {
    backgroundColor: colors.softGreen,
    bottom: -60,
    height: '48%',
    position: 'absolute',
    transform: [{ rotate: '-7deg' }],
    width: '120%',
  },
  mockPhotoEmoji: {
    fontSize: 76,
  },
  mockPhotoBadge: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    bottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: 'absolute',
    right: 16,
  },
  mockPhotoBadgeText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  proofMark: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    left: 18,
    letterSpacing: -0.5,
    lineHeight: 10,
    position: 'absolute',
    top: 17,
  },
  visualLabel: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    bottom: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
    position: 'absolute',
    right: 18,
  },
  visualLabelText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  reactionList: {
    flexDirection: 'row',
    gap: 4,
  },
  reactionButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  reactionButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.ink,
  },
  reactionEmoji: {
    fontSize: 17,
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  verifiedText: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  friendReactionSummary: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    flexDirection: 'row',
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  reactionsSection: {
    marginHorizontal: 14,
    marginTop: 12,
  },
  activityVisibility: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginHorizontal: 15,
    marginTop: 11,
  },
  activityVisibilityText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  reactorAvatars: {
    flexDirection: 'row',
    marginRight: 9,
  },
  reactorAvatar: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderColor: colors.surface,
    borderRadius: 13,
    borderWidth: 2,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  reactorAvatarOverlap: {
    marginLeft: -7,
  },
  reactorInitial: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: '900',
  },
  friendReactionText: {
    color: colors.ink,
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  reactionDetails: {
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  reactionDetailsTitle: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  expandedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  reactionDetailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 45,
    paddingHorizontal: 12,
  },
  reactionDetailAvatar: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    marginRight: 9,
    width: 26,
  },
  reactionDetailName: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  reactionDetailEmoji: {
    fontSize: 19,
  },
  description: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 11,
  },
  comments: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
    paddingBottom: 15,
    paddingTop: 11,
  },
  commentSummary: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  commentSummaryAvatar: {
    alignItems: 'center',
    backgroundColor: colors.softBlue,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    marginRight: 9,
    width: 26,
  },
  commentSummaryCopy: {
    flex: 1,
  },
  commentSummaryName: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  commentSummaryMessage: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  commentCount: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    marginHorizontal: 7,
  },
  commentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 7,
  },
  commentAvatar: {
    alignItems: 'center',
    backgroundColor: colors.softBlue,
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    marginRight: 8,
    width: 26,
  },
  commentInitial: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: '900',
  },
  commentBubble: {
    backgroundColor: colors.background,
    borderRadius: radii.small,
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  commentText: {
    color: colors.ink,
    fontSize: 12,
    lineHeight: 17,
  },
  commentName: {
    fontWeight: '900',
  },
  commentComposerWrapper: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 12,
  },
  commentComposer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    minHeight: 38,
    paddingHorizontal: 13,
  },
  commentSubmitButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  commentSubmitButtonDisabled: {
    opacity: 0.45,
  },
});
