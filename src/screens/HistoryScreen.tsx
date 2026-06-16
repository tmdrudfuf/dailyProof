import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCheckIns } from '../context/CheckInContext';
import { useGoals } from '../context/GoalContext';
import { colors, radii } from '../theme';
import { CheckIn } from '../types/checkIn';
import { Goal, GoalCategory } from '../types/goal';
import { ProfileStackParamList } from '../types/navigation';

type HistoryScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'HistoryStats'
>;

type TimeBlock =
  | 'Early morning'
  | 'Morning'
  | 'Afternoon'
  | 'Evening'
  | 'Night';

const timeBlocks: TimeBlock[] = [
  'Early morning',
  'Morning',
  'Afternoon',
  'Evening',
  'Night',
];

function getDateKey(createdAt: string) {
  return new Date(createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTimeLabel(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getMinutesFromMidnight(createdAt: string) {
  const date = new Date(createdAt);
  return date.getHours() * 60 + date.getMinutes();
}

function formatAverageTime(totalMinutes: number, count: number) {
  if (count === 0) {
    return 'No check-ins yet';
  }

  const averageMinutes = Math.round(totalMinutes / count);
  const hours = Math.floor(averageMinutes / 60) % 24;
  const minutes = averageMinutes % 60;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function getTimeBlock(createdAt: string): TimeBlock {
  const hour = new Date(createdAt).getHours();

  if (hour < 6) {
    return 'Early morning';
  }

  if (hour < 12) {
    return 'Morning';
  }

  if (hour < 18) {
    return 'Afternoon';
  }

  if (hour < 22) {
    return 'Evening';
  }

  return 'Night';
}

function getMostCommonTimeBlock(checkIns: CheckIn[]) {
  if (checkIns.length === 0) {
    return 'No check-ins yet';
  }

  const counts = timeBlocks.reduce<Record<TimeBlock, number>>(
    (result, block) => ({
      ...result,
      [block]: 0,
    }),
    {
      'Early morning': 0,
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
    }
  );

  checkIns.forEach((checkIn) => {
    counts[getTimeBlock(checkIn.createdAt)] += 1;
  });

  return timeBlocks.reduce((winner, block) =>
    counts[block] > counts[winner] ? block : winner
  );
}

function getCompletionRate(goal: Goal, successfulCheckIns: number) {
  if (goal.successTarget <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((successfulCheckIns / goal.successTarget) * 100));
}

export function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { checkIns, error: checkInError, isLoading, refreshCheckIns } = useCheckIns();
  const {
    error: goalError,
    goals,
    isLoading: isLoadingGoals,
    refreshGoals,
  } = useGoals();
  const [selectedGoalId, setSelectedGoalId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>(
    'all'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [failedPhotoIds, setFailedPhotoIds] = useState<Record<string, boolean>>(
    {}
  );

  const filteredCheckIns = useMemo(() => {
    const checkInsForGoal =
      selectedGoalId === 'all'
        ? checkIns
        : checkIns.filter((checkIn) => checkIn.goalId === selectedGoalId);

    const checkInsForCategory =
      selectedCategory === 'all'
        ? checkInsForGoal
        : checkInsForGoal.filter(
            (checkIn) => checkIn.category === selectedCategory
          );

    if (selectedCategory === 'all') {
      return checkInsForCategory;
    }

    return [...checkInsForCategory].sort(
      (first, second) =>
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
    );
  }, [checkIns, selectedCategory, selectedGoalId]);

  const groupedCheckIns = useMemo(() => {
    return filteredCheckIns.reduce<
      Array<{ date: string; checkIns: CheckIn[] }>
    >((groups, checkIn) => {
      const date = getDateKey(checkIn.createdAt);
      const existingGroup = groups.find((group) => group.date === date);

      if (existingGroup) {
        existingGroup.checkIns.push(checkIn);
      } else {
        groups.push({ date, checkIns: [checkIn] });
      }

      return groups;
    }, []);
  }, [filteredCheckIns]);

  const analytics = useMemo(() => {
    return goals.map((goal) => {
      const successfulCheckIns = checkIns.filter(
        (checkIn) =>
          checkIn.goalId === goal.id && checkIn.aiResult === 'approved'
      );
      const totalMinutes = successfulCheckIns.reduce(
        (total, checkIn) => total + getMinutesFromMidnight(checkIn.createdAt),
        0
      );

      return {
        goal,
        averageTime: formatAverageTime(totalMinutes, successfulCheckIns.length),
        completionRate: getCompletionRate(goal, successfulCheckIns.length),
        mostCommonBlock: getMostCommonTimeBlock(successfulCheckIns),
        totalSuccessful: successfulCheckIns.length,
      };
    });
  }, [checkIns, goals]);

  const error = checkInError || goalError;
  const loading = isLoading || isLoadingGoals;

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      await Promise.all([refreshCheckIns(), refreshGoals()]);
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons color={colors.ink} name="chevron-back" size={22} />
        </Pressable>
        <View>
          <Text style={styles.title}>History & Stats</Text>
          <Text style={styles.subtitle}>Your proofs, patterns, and momentum.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={colors.ink}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Goal filter</Text>
        <ScrollView
          contentContainerStyle={styles.filterList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            onPress={() => {
              setSelectedGoalId('all');
              setSelectedCategory('all');
            }}
            style={[
              styles.filterChip,
              selectedGoalId === 'all' &&
                selectedCategory === 'all' &&
                styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedGoalId === 'all' &&
                  selectedCategory === 'all' &&
                  styles.filterTextActive,
              ]}
            >
              All goals
            </Text>
          </Pressable>
          {goals.map((goal) => (
            <Pressable
              key={goal.id}
              onPress={() => {
                setSelectedGoalId(goal.id);
                setSelectedCategory('all');
              }}
              style={[
                styles.filterChip,
                selectedGoalId === goal.id && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedGoalId === goal.id && styles.filterTextActive,
                ]}
              >
                {goal.categoryEmoji} {goal.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Analytics</Text>
        {analytics.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptyCopy}>
              Create a goal and check in to start seeing stats.
            </Text>
          </View>
        ) : (
          analytics.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.goal.id}
              onPress={() => {
                setSelectedCategory((currentCategory) =>
                  currentCategory === item.goal.category
                    ? 'all'
                    : item.goal.category
                );
                setSelectedGoalId('all');
              }}
              style={[
                styles.analyticsCard,
                selectedCategory === item.goal.category &&
                  styles.analyticsCardActive,
              ]}
            >
              <View style={styles.analyticsHeader}>
                <Text style={styles.goalEmoji}>{item.goal.categoryEmoji}</Text>
                <View style={styles.analyticsTitleWrap}>
                  <Text style={styles.goalTitle}>{item.goal.title}</Text>
                  <Text style={styles.goalMeta}>
                    Tap to view {item.goal.category} photos in time order
                  </Text>
                </View>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>{item.completionRate}%</Text>
                </View>
              </View>

              <View style={styles.analyticsGrid}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Completion</Text>
                  <Text style={styles.metricValue}>{item.completionRate}%</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Common block</Text>
                  <Text style={styles.metricValue}>{item.mostCommonBlock}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Average time</Text>
                  <Text style={styles.metricValue}>{item.averageTime}</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}

        <View style={styles.historyTitleRow}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'Check-in history'
              : `${selectedCategory} photos`}
          </Text>
        </View>
        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color={colors.ink} />
            <Text style={styles.emptyCopy}>Loading history...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Could not load history</Text>
            <Text style={styles.emptyCopy}>{error}</Text>
            <Pressable onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : groupedCheckIns.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No check-ins yet</Text>
            <Text style={styles.emptyCopy}>
              Your completed proofs will show up here by date.
            </Text>
          </View>
        ) : (
          groupedCheckIns.map((group) => (
            <View key={group.date} style={styles.dateGroup}>
              <Text style={styles.dateTitle}>{group.date}</Text>
              {group.checkIns.map((checkIn) => (
                <View key={checkIn.id} style={styles.historyCard}>
                  {checkIn.photoUrl && !failedPhotoIds[checkIn.id] ? (
                    <Image
                      onError={() => {
                        console.warn('[HistoryScreen] Failed to load history photo.', {
                          checkInId: checkIn.id,
                        });
                        setFailedPhotoIds((current) => ({
                          ...current,
                          [checkIn.id]: true,
                        }));
                      }}
                      source={{ uri: checkIn.photoUrl }}
                      style={styles.historyImage}
                    />
                  ) : (
                    <View style={[styles.historyImage, styles.historyImageFallback]}>
                      <Text style={styles.historyImageFallbackEmoji}>
                        {checkIn.categoryEmoji || '✨'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.historyCopy}>
                    <Text style={styles.historyTitle}>
                      {checkIn.categoryEmoji} {checkIn.goalTitle}
                    </Text>
                    <Text style={styles.historyTime}>
                      {getTimeLabel(checkIn.createdAt)}
                    </Text>
                    <View style={styles.confidenceRow}>
                      <Text style={styles.confidenceText}>
                        AI confidence {checkIn.aiConfidence}%
                      </Text>
                    </View>
                    <Text style={styles.feedback}>{checkIn.aiFeedback}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  title: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    paddingBottom: 34,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  filterList: {
    gap: 9,
    paddingRight: 18,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  filterText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  filterTextActive: {
    color: colors.surface,
  },
  analyticsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  analyticsCardActive: {
    backgroundColor: colors.softGreen,
    borderColor: colors.ink,
  },
  analyticsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  goalEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  analyticsTitleWrap: {
    flex: 1,
  },
  goalTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  goalMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  rateBadge: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  rateText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  analyticsGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },
  metric: {
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    flex: 1,
    padding: 11,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
  dateGroup: {
    marginBottom: 17,
  },
  historyTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 9,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
  },
  historyImage: {
    backgroundColor: colors.line,
    height: 128,
    width: 108,
  },
  historyImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyImageFallbackEmoji: {
    fontSize: 32,
  },
  historyCopy: {
    flex: 1,
    padding: 13,
  },
  historyTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  historyTime: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  confidenceRow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softGreen,
    borderRadius: radii.pill,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confidenceText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  feedback: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 9,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
    padding: 20,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
});
