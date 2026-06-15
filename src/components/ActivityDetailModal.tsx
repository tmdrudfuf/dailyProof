import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radii } from '../theme';
import { Friend, FriendComment, FriendReaction } from '../types/friend';
import { MentionText } from './MentionText';
import {
  getActiveMentionQuery,
  insertMention,
  MentionSuggestions,
} from './MentionSuggestions';

type ActivityDetailModalProps = {
  comments: FriendComment[];
  mentionableFriends?: Friend[];
  mode: 'comments' | 'reactions' | null;
  onClose: () => void;
  onSubmitComment?: (
    message: string,
    parentCommentId?: string
  ) => Promise<void> | void;
  onPressMention?: (friend: Friend) => void;
  reactions: FriendReaction[];
};

function getMentionName(comment: Pick<FriendComment, 'displayName' | 'username'>) {
  return (
    comment.username ||
    `@${comment.displayName.trim().toLowerCase().replace(/\s+/g, '_')}`
  );
}

export function ActivityDetailModal({
  comments,
  mentionableFriends = [],
  mode,
  onClose,
  onPressMention,
  onSubmitComment,
  reactions,
}: ActivityDetailModalProps) {
  const isVisible = mode !== null;
  const title = mode === 'reactions' ? 'All reactions' : 'All comments';
  const [commentDraft, setCommentDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState<FriendComment | null>(null);
  const mentionQuery = getActiveMentionQuery(commentDraft);
  const topLevelComments = comments.filter(
    (comment) => !comment.parentCommentId
  );
  const repliesByCommentId = comments.reduce<Record<string, FriendComment[]>>(
    (replies, comment) => {
      if (!comment.parentCommentId) {
        return replies;
      }

      return {
        ...replies,
        [comment.parentCommentId]: [
          ...(replies[comment.parentCommentId] ?? []),
          comment,
        ],
      };
    },
    {}
  );

  const startReply = (comment: FriendComment) => {
    setReplyTarget(comment);
    setCommentDraft(`${getMentionName(comment)} `);
  };

  const submitComment = async () => {
    const message = commentDraft.trim();

    if (!message) {
      return;
    }

    setCommentDraft('');
    const parentCommentId = replyTarget?.id;
    setReplyTarget(null);
    await onSubmitComment?.(message, parentCommentId);
  };

  const pressMention = (friend: Friend) => {
    onClose();
    onPressMention?.(friend);
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close activity popup"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.panel}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>FRIEND ACTIVITY</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            <Pressable
              accessibilityLabel="Close"
              hitSlop={10}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color={colors.ink} name="close" size={20} />
            </Pressable>
          </View>

          <ScrollView
            bounces
            contentContainerStyle={styles.list}
            nestedScrollEnabled
            scrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
          >
            {mode === 'reactions'
              ? reactions.map((item) => (
                  <View
                    key={`${item.friendId}-${item.reaction}-modal`}
                    style={styles.row}
                  >
                    <View style={[styles.avatar, styles.reactionAvatar]}>
                      <Text style={styles.initial}>
                        {item.displayName.slice(0, 1)}
                      </Text>
                    </View>
                    <Text style={styles.name}>{item.displayName}</Text>
                    <Text style={styles.reaction}>{item.reaction}</Text>
                  </View>
                ))
              : topLevelComments.map((comment) => (
                  <View key={`${comment.id}-modal`}>
                    <View style={styles.commentRow}>
                      <View style={[styles.avatar, styles.commentAvatar]}>
                        <Text style={styles.initial}>
                          {comment.displayName.slice(0, 1)}
                        </Text>
                      </View>
                      <View style={styles.commentCopy}>
                        <View style={styles.commentNameRow}>
                          <Text style={styles.name}>{comment.displayName}</Text>
                          <Text style={styles.username}>
                            {getMentionName(comment)}
                          </Text>
                        </View>
                        <MentionText
                          friends={mentionableFriends}
                          onPressMention={pressMention}
                          style={styles.commentMessage}
                          text={comment.message}
                        />
                        {onSubmitComment ? (
                          <Pressable
                            accessibilityLabel={`Reply to ${comment.displayName}`}
                            accessibilityRole="button"
                            onPress={() => startReply(comment)}
                          >
                            <Text style={styles.replyAction}>Reply</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>

                    {(repliesByCommentId[comment.id] ?? []).map((reply) => (
                      <View
                        key={`${reply.id}-reply-modal`}
                        style={[styles.commentRow, styles.replyRow]}
                      >
                        <View style={[styles.avatar, styles.replyAvatar]}>
                          <Text style={styles.initial}>
                            {reply.displayName.slice(0, 1)}
                          </Text>
                        </View>
                        <View style={styles.commentCopy}>
                          <View style={styles.commentNameRow}>
                            <Text style={styles.name}>
                              {reply.displayName}
                            </Text>
                            <Text style={styles.username}>
                              {getMentionName(reply)}
                            </Text>
                          </View>
                          <MentionText
                            friends={mentionableFriends}
                            onPressMention={pressMention}
                            style={styles.commentMessage}
                            text={reply.message}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
          </ScrollView>

          {mode === 'comments' && onSubmitComment ? (
            <View style={styles.composer}>
              {replyTarget ? (
                <View style={styles.replyingTo}>
                  <Text style={styles.replyingText}>
                    Replying to {getMentionName(replyTarget)}
                  </Text>
                  <Pressable
                    accessibilityLabel="Cancel reply"
                    onPress={() => {
                      setReplyTarget(null);
                      setCommentDraft('');
                    }}
                  >
                    <Ionicons color={colors.muted} name="close" size={16} />
                  </Pressable>
                </View>
              ) : null}
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
              <View style={styles.composerRow}>
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
                    styles.sendButton,
                    !commentDraft.trim() && styles.sendButtonDisabled,
                  ]}
                >
                  <Ionicons color={colors.ink} name="send" size={16} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Text style={styles.dismissHint}>Tap outside to close</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    alignItems: 'center',
    backgroundColor: 'rgba(23, 24, 21, 0.66)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.large,
    height: '70%',
    overflow: 'hidden',
    paddingBottom: 15,
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.line,
    borderRadius: radii.pill,
    height: 4,
    marginTop: 10,
    width: 42,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollArea: {
    flex: 1,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 62,
  },
  commentRow: {
    alignItems: 'flex-start',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingVertical: 13,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: 11,
    width: 36,
  },
  reactionAvatar: {
    backgroundColor: colors.softGreen,
  },
  commentAvatar: {
    backgroundColor: colors.softBlue,
  },
  initial: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  name: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  reaction: {
    fontSize: 24,
  },
  commentCopy: {
    flex: 1,
    paddingTop: 2,
  },
  commentNameRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 6,
  },
  commentMessage: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  username: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  replyAction: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 8,
  },
  replyRow: {
    borderBottomWidth: 0,
    marginLeft: 42,
    paddingTop: 4,
  },
  replyAvatar: {
    backgroundColor: colors.softGreen,
  },
  composer: {
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  replyingTo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  replyingText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  composerRow: {
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
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  dismissHint: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    paddingTop: 10,
    textAlign: 'center',
  },
});
