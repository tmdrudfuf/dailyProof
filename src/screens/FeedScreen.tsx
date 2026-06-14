import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { FeedCard } from '../components/FeedCard';
import { useCheckIns } from '../context/CheckInContext';
import { useFriends } from '../context/FriendContext';
import { useGoals } from '../context/GoalContext';
import {
  getCommentsForPost,
  getReactionsForPost,
} from '../services/friendService';
import { colors, radii } from '../theme';

function getCheckInTime(createdAt?: string) {
  if (!createdAt) {
    return 'Just now';
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function FeedScreen() {
  const {
    checkInFeedPosts,
    error: checkInError,
    hasCheckedInToday,
    isLoading: isLoadingCheckIns,
    refreshCheckIns,
  } = useCheckIns();
  const { friendFeedItems, reactions, toggleReaction } = useFriends();
  const { activeGoals } = useGoals();
  const restoredCheckInPosts = checkInFeedPosts.map((post) => ({
    ...post,
    timeAgo: getCheckInTime(post.createdAt),
  }));
  const friendCheckInPosts = friendFeedItems.map((post) => ({
    ...post,
    timeAgo: getCheckInTime(post.createdAt),
  }));
  const feedPosts = [...restoredCheckInPosts, ...friendCheckInPosts].sort(
    (first, second) =>
      new Date(second.createdAt ?? 0).getTime() -
      new Date(first.createdAt ?? 0).getTime()
  );
  const provedGoalCount = activeGoals.filter((goal) =>
    hasCheckedInToday(goal.id),
  ).length;
  const totalGoalCount = activeGoals.length;
  const progressPercentage =
    totalGoalCount === 0 ? 0 : (provedGoalCount / totalGoalCount) * 100;
  const completedAllGoals =
    totalGoalCount > 0 && provedGoalCount === totalGoalCount;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={feedPosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.eyebrow}>WED, JUNE 10</Text>
                <Text style={styles.brand}>DailyProof.</Text>
              </View>
              <View style={styles.topActions}>
                <Pressable accessibilityLabel="Notifications" style={styles.iconButton}>
                  <Ionicons color={colors.ink} name="notifications-outline" size={21} />
                  <View style={styles.notificationDot} />
                </Pressable>
                <Avatar initials="DP" size={42} />
              </View>
            </View>

            <View style={styles.todayCard}>
              <View style={styles.todayCopy}>
                <Text style={styles.todayLabel}>YOUR DAY</Text>
                <Text style={styles.todayTitle}>
                  {completedAllGoals
                    ? 'All promises kept.'
                    : 'One promise.'}
                  {'\n'}
                  {completedAllGoals ? 'You made it visible.' : 'Make it visible.'}
                </Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progressPercentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {provedGoalCount} of {totalGoalCount}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.checkMark,
                  provedGoalCount === 0 && styles.checkMarkInactive,
                ]}
              >
                <Ionicons
                  color={provedGoalCount === 0 ? '#777B74' : colors.ink}
                  name={completedAllGoals ? 'checkmark-done' : 'checkmark'}
                  size={28}
                />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s proofs</Text>
              <Pressable accessibilityRole="button">
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <View style={styles.filters}>
              <View style={[styles.filter, styles.activeFilter]}>
                <Text style={[styles.filterText, styles.activeFilterText]}>Friends</Text>
              </View>
              <View style={styles.filter}>
                <Text style={styles.filterText}>Mine</Text>
              </View>
              <View style={styles.filter}>
                <Text style={styles.filterText}>Following</Text>
              </View>
            </View>

            {isLoadingCheckIns ? (
              <View style={styles.statusBanner}>
                <ActivityIndicator color={colors.ink} size="small" />
                <Text style={styles.statusText}>Loading your check-ins...</Text>
              </View>
            ) : checkInError ? (
              <View style={[styles.statusBanner, styles.errorBanner]}>
                <Text style={[styles.statusText, styles.errorText]}>
                  {checkInError}
                </Text>
                <Pressable onPress={() => void refreshCheckIns()}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <FeedCard
            friendComments={getCommentsForPost(
              item.id,
              item.friendId
            )}
            friendReactions={getReactionsForPost(
              item.id,
              item.friendId
            )}
            onToggleReaction={(reaction) =>
              toggleReaction(item.id, reaction)
            }
            post={item}
            selectedReactions={reactions[item.id]}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 36,
    paddingHorizontal: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 22,
    paddingTop: 12,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  brand: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -1.4,
    marginTop: 2,
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
  },
  notificationDot: {
    backgroundColor: colors.accentDark,
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 2,
    height: 9,
    position: 'absolute',
    right: 9,
    top: 8,
    width: 9,
  },
  todayCard: {
    backgroundColor: colors.dark,
    borderRadius: radii.large,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 188,
    overflow: 'hidden',
    padding: 22,
  },
  todayCopy: {
    flex: 1,
  },
  todayLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  todayTitle: {
    color: colors.surface,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 31,
    marginTop: 13,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  progressTrack: {
    backgroundColor: '#454842',
    borderRadius: radii.pill,
    height: 5,
    overflow: 'hidden',
    width: 118,
  },
  progressFill: {
    backgroundColor: colors.accent,
    height: '100%',
  },
  progressText: {
    color: '#AEB2A9',
    fontSize: 11,
    fontWeight: '700',
  },
  checkMark: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginTop: 42,
    transform: [{ rotate: '-8deg' }],
    width: 60,
  },
  checkMarkInactive: {
    backgroundColor: '#3A3D38',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  seeAll: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    marginTop: 14,
  },
  filter: {
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activeFilter: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  filterText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  activeFilterText: {
    color: colors.surface,
  },
  separator: {
    height: 14,
  },
  statusBanner: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    padding: 12,
  },
  statusText: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
  },
  errorBanner: {
    backgroundColor: '#FBE9E6',
  },
  errorText: {
    color: '#8E342D',
  },
  retryText: {
    color: '#8E342D',
    fontSize: 12,
    fontWeight: '900',
  },
});
