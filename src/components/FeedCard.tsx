import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../theme';
import { FeedPost } from '../types/feed';
import { Avatar } from './Avatar';

type FeedCardProps = {
  post: FeedPost;
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

export function FeedCard({ post }: FeedCardProps) {
  const visual = visualConfig[post.visual];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar initials={post.initials} tone={visual.tone} />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{post.friendName}</Text>
          <Text style={styles.time}>
            {post.goal} · {post.timeAgo}
          </Text>
        </View>
        <Pressable accessibilityLabel="More options" hitSlop={12}>
          <Ionicons color={colors.muted} name="ellipsis-horizontal" size={20} />
        </Pressable>
      </View>

      <View style={[styles.proofVisual, { backgroundColor: visual.background }]}>
        <Text style={styles.proofMark}>DAILY{'\n'}PROOF</Text>
        <Ionicons color={colors.ink} name={visual.icon} size={72} />
        <View style={styles.visualLabel}>
          <Text style={styles.visualLabelText}>{visual.label}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.reactions}>
          <Pressable accessibilityLabel="Cheer this proof" style={styles.actionButton}>
            <Ionicons color={colors.ink} name="heart-outline" size={22} />
          </Pressable>
          <Text style={styles.reactionCount}>{post.reactions}</Text>
          <Pressable accessibilityLabel="Comment on this proof" style={styles.actionButton}>
            <Ionicons color={colors.ink} name="chatbubble-outline" size={20} />
          </Pressable>
        </View>
        <View style={styles.streak}>
          <Ionicons color={colors.ink} name="flame-outline" size={16} />
          <Text style={styles.streakText}>{post.streak} day streak</Text>
        </View>
      </View>

      <Text style={styles.description}>
        <Text style={styles.friendName}>{post.friendName} </Text>
        {post.proof}
      </Text>
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
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  reactions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    padding: 3,
  },
  reactionCount: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
  },
  streak: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '800',
  },
  description: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 11,
  },
});
