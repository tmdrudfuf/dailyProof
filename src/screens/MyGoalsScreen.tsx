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

import { GoalCard } from '../components/GoalCard';
import { useGoals } from '../context/GoalContext';
import { colors, radii } from '../theme';
import { ProfileStackParamList } from '../types/navigation';

type MyGoalsScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'MyGoals'
>;

export function MyGoalsScreen({ navigation }: MyGoalsScreenProps) {
  const { activeGoals, canAddGoal } = useGoals();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={activeGoals}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(goal) => goal.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons color={colors.ink} name="flag-outline" size={30} />
            </View>
            <Text style={styles.emptyTitle}>Start with one promise.</Text>
            <Text style={styles.emptyText}>
              Create a goal you can prove with small, consistent actions.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              disabled={!canAddGoal}
              onPress={() => navigation.navigate('CreateGoal')}
              style={({ pressed }) => [
                styles.addButton,
                !canAddGoal && styles.addButtonDisabled,
                pressed && canAddGoal && styles.addButtonPressed,
              ]}
            >
              <Ionicons
                color={canAddGoal ? colors.ink : colors.muted}
                name="add"
                size={21}
              />
              <Text
                style={[
                  styles.addButtonText,
                  !canAddGoal && styles.addButtonTextDisabled,
                ]}
              >
                Add Goal
              </Text>
            </Pressable>
            {!canAddGoal ? (
              <Text style={styles.limitText}>
                You can have up to 3 active goals.
              </Text>
            ) : null}
          </View>
        }
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Back to profile"
                hitSlop={10}
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons color={colors.ink} name="arrow-back" size={22} />
              </Pressable>
              <Text style={styles.headerTitle}>My Goals</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.summary}>
              <Text style={styles.eyebrow}>CURRENT CAPACITY</Text>
              <Text style={styles.summaryTitle}>
                Active {activeGoals.length}/3
              </Text>
              <Text style={styles.summaryText}>
                Keep your focus narrow. You can work on up to three active goals.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>ACTIVE GOALS</Text>
          </>
        }
        renderItem={({ item }) => <GoalCard goal={item} />}
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
    paddingBottom: 32,
    paddingHorizontal: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingTop: 8,
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
  headerTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 42,
  },
  summary: {
    backgroundColor: colors.dark,
    borderRadius: radii.large,
    padding: 21,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  summaryTitle: {
    color: colors.surface,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 9,
  },
  summaryText: {
    color: '#AAAEA6',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 300,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
    marginTop: 25,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 27,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 17,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    textAlign: 'center',
  },
  footer: {
    paddingTop: 18,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 54,
  },
  addButtonDisabled: {
    backgroundColor: colors.line,
  },
  addButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  addButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  addButtonTextDisabled: {
    color: colors.muted,
  },
  limitText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
});
