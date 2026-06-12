import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCheckIns } from '../context/CheckInContext';
import { useGoals } from '../context/GoalContext';
import { colors, radii } from '../theme';
import {
  CameraStackParamList,
  RootTabParamList,
} from '../types/navigation';

type CheckInResultScreenProps = NativeStackScreenProps<
  CameraStackParamList,
  'CheckInResult'
>;

export function CheckInResultScreen({
  navigation,
  route,
}: CheckInResultScreenProps) {
  const { checkIns } = useCheckIns();
  const { goals } = useGoals();
  const checkIn = checkIns.find((item) => item.id === route.params.checkInId);
  const goal = goals.find((item) => item.id === checkIn?.goalId);

  function returnToFeed() {
    navigation.popToTop();
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate('Feed');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.verifiedIcon}>
          <Ionicons color={colors.ink} name="checkmark" size={46} />
        </View>
        <Text style={styles.eyebrow}>MOCK VERIFICATION</Text>
        <Text style={styles.title}>Verified</Text>
        <Text style={styles.subtitle}>Verified successfully.</Text>

        <View style={styles.resultCard}>
          <Text style={styles.cardLabel}>GOAL</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalEmoji}>{goal?.categoryEmoji ?? '✨'}</Text>
            <Text style={styles.goalTitle}>{goal?.title ?? 'Goal'}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardLabel}>CONFIDENCE</Text>
          <Text style={styles.confidence}>
            {checkIn?.aiConfidence ?? 0}%
          </Text>
          <View style={styles.confidenceTrack}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${checkIn?.aiConfidence ?? 0}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.notice}>
          <Ionicons color={colors.ink} name="information-circle-outline" size={18} />
          <Text style={styles.noticeText}>
            This confidence score is randomly generated for the local MVP.
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={returnToFeed}
        style={({ pressed }) => [
          styles.feedButton,
          pressed && styles.feedButtonPressed,
        ]}
      >
        <Text style={styles.feedButtonText}>Return to Feed</Text>
        <Ionicons color={colors.ink} name="arrow-forward" size={20} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: 18,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  verifiedIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 43,
    height: 86,
    justifyContent: 'center',
    transform: [{ rotate: '-7deg' }],
    width: 86,
  },
  eyebrow: {
    color: colors.accentDark,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginTop: 25,
  },
  title: {
    color: colors.ink,
    fontSize: 35,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 5,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 28,
    padding: 20,
    width: '100%',
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  goalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 9,
  },
  goalEmoji: {
    fontSize: 25,
  },
  goalTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 10,
  },
  divider: {
    backgroundColor: colors.line,
    height: 1,
    marginVertical: 18,
  },
  confidence: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 5,
  },
  confidenceTrack: {
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    height: 7,
    marginTop: 11,
    overflow: 'hidden',
  },
  confidenceFill: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    height: '100%',
  },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
    width: '100%',
  },
  noticeText: {
    color: colors.ink,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  feedButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
  },
  feedButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.99 }],
  },
  feedButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
});
