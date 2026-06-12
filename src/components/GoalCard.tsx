import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../theme';
import { Goal } from '../types/goal';

type GoalCardProps = {
  goal: Goal;
  onDelete?: () => void;
};

function parseDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getGoalDuration(goal: Goal) {
  const start = parseDate(goal.startDate);
  const end = parseDate(goal.endDate);

  if (!start || !end || end < start) {
    return { currentDay: 1, totalDays: 1 };
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays =
    Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
  const elapsedDays =
    Math.floor((today.getTime() - start.getTime()) / millisecondsPerDay) + 1;
  const currentDay = Math.min(Math.max(elapsedDays, 1), totalDays);

  return { currentDay, totalDays };
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const { currentDay, totalDays } = getGoalDuration(goal);
  const progress = Math.min(
    goal.completedDays / Math.max(goal.successTarget, 1),
    1,
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.emoji}>
          <Text style={styles.emojiText}>{goal.categoryEmoji}</Text>
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.category}>{goal.category.toUpperCase()}</Text>
          <Text style={styles.title}>{goal.title}</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>ACTIVE</Text>
          </View>
          {onDelete ? (
            <Pressable
              accessibilityLabel={`Delete ${goal.title}`}
              hitSlop={8}
              onPress={onDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
            >
              <Ionicons color="#A23A32" name="trash-outline" size={18} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.dayText}>
          Day {currentDay} / {totalDays}
        </Text>
        <Text style={styles.completedText}>
          {goal.completedDays} / {goal.successTarget} days
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons color={colors.muted} name="alarm-outline" size={17} />
          <Text style={styles.metaText}>{goal.reminderTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons
            color={colors.muted}
            name={
              goal.visibility === 'Private'
                ? 'lock-closed-outline'
                : goal.visibility === 'Public'
                  ? 'globe-outline'
                  : 'people-outline'
            }
            size={17}
          />
          <Text style={styles.metaText}>{goal.visibility}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  emoji: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  emojiText: {
    fontSize: 24,
  },
  titleGroup: {
    flex: 1,
    marginLeft: 12,
  },
  category: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  activeBadge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#F8E8E5',
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  deleteButtonPressed: {
    opacity: 0.55,
  },
  activeDot: {
    backgroundColor: colors.accentDark,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  activeText: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dayText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  completedText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    height: 7,
    marginTop: 9,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    height: '100%',
  },
  meta: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 22,
    marginTop: 17,
    paddingTop: 14,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metaText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
