import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radii } from '../theme';
import { FriendComment, FriendReaction } from '../types/friend';

type ActivityDetailModalProps = {
  comments: FriendComment[];
  mode: 'comments' | 'reactions' | null;
  onClose: () => void;
  reactions: FriendReaction[];
};

export function ActivityDetailModal({
  comments,
  mode,
  onClose,
  reactions,
}: ActivityDetailModalProps) {
  const isVisible = mode !== null;
  const title = mode === 'reactions' ? 'All reactions' : 'All comments';

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
              : comments.map((comment) => (
                  <View key={`${comment.id}-modal`} style={styles.commentRow}>
                    <View style={[styles.avatar, styles.commentAvatar]}>
                      <Text style={styles.initial}>
                        {comment.displayName.slice(0, 1)}
                      </Text>
                    </View>
                    <View style={styles.commentCopy}>
                      <Text style={styles.name}>{comment.displayName}</Text>
                      <Text style={styles.commentMessage}>
                        {comment.message}
                      </Text>
                    </View>
                  </View>
                ))}
          </ScrollView>

          <Text style={styles.dismissHint}>Tap outside to close</Text>
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
  commentMessage: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  dismissHint: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    paddingTop: 10,
    textAlign: 'center',
  },
});
