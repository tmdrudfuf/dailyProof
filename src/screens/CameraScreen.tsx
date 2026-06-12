import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCheckIns } from '../context/CheckInContext';
import { useGoals } from '../context/GoalContext';
import { colors, radii } from '../theme';
import { CameraStackParamList } from '../types/navigation';

type CameraScreenProps = NativeStackScreenProps<
  CameraStackParamList,
  'CameraGoals'
>;

export function CameraScreen({ navigation }: CameraScreenProps) {
  const { activeGoals } = useGoals();
  const { hasCheckedInToday } = useCheckIns();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={activeGoals}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(goal) => goal.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons color={colors.muted} name="flag-outline" size={32} />
            <Text style={styles.emptyTitle}>No active goals</Text>
            <Text style={styles.emptyText}>
              Create an active goal in Profile before checking in.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>NEW CHECK-IN</Text>
            <Text style={styles.title}>What are you{'\n'}proving today?</Text>
            <Text style={styles.subtitle}>
              Select one active goal before adding your proof.
            </Text>
            <Text style={styles.sectionLabel}>ACTIVE GOALS</Text>
          </View>
        }
        renderItem={({ item }) => {
          const provedToday = hasCheckedInToday(item.id);

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('CheckIn', { goalId: item.id })}
              style={({ pressed }) => [
                styles.goalCard,
                provedToday && styles.goalCardProved,
                pressed && styles.goalCardPressed,
              ]}
            >
              <View style={[styles.emoji, provedToday && styles.emojiProved]}>
                <Text style={styles.emojiText}>{item.categoryEmoji}</Text>
              </View>
              <View style={styles.goalCopy}>
                <Text style={styles.category}>{item.category.toUpperCase()}</Text>
                <Text style={styles.goalTitle}>{item.title}</Text>
                {provedToday ? (
                  <View style={styles.provedStatus}>
                    <Ionicons
                      color={colors.accentDark}
                      name="checkmark-circle"
                      size={15}
                    />
                    <Text style={styles.provedStatusText}>Proved today</Text>
                  </View>
                ) : (
                  <Text style={styles.goalProgress}>
                    {item.completedDays} of {item.successTarget} proof days
                  </Text>
                )}
              </View>
              <View style={[styles.arrow, provedToday && styles.arrowProved]}>
                <Ionicons
                  color={colors.ink}
                  name={provedToday ? 'checkmark' : 'arrow-forward'}
                  size={19}
                />
              </View>
            </Pressable>
          );
        }}
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
    flexGrow: 1,
    paddingBottom: 34,
    paddingHorizontal: 18,
  },
  header: {
    paddingBottom: 12,
    paddingTop: 22,
  },
  eyebrow: {
    color: colors.accentDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 37,
    marginTop: 10,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginLeft: 4,
    marginTop: 30,
  },
  goalCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 96,
    padding: 14,
  },
  goalCardPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.99 }],
  },
  goalCardProved: {
    backgroundColor: '#F8FDEB',
    borderColor: colors.accentDark,
  },
  emoji: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  emojiText: {
    fontSize: 27,
  },
  emojiProved: {
    backgroundColor: colors.accent,
  },
  goalCopy: {
    flex: 1,
    marginLeft: 13,
  },
  category: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  goalTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 3,
  },
  goalProgress: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
  },
  provedStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
  },
  provedStatusText: {
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: '900',
  },
  arrow: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  arrowProved: {
    backgroundColor: colors.accent,
  },
  separator: {
    height: 11,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 8,
    padding: 32,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
});
