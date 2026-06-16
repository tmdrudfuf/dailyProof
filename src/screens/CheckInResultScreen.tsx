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
  const checkIn = route.params.checkInId
    ? checkIns.find((item) => item.id === route.params.checkInId)
    : undefined;
  const goal = goals.find(
    (item) => item.id === (checkIn?.goalId ?? route.params.goalId)
  );
  const isApproved = route.params.aiResult === 'approved';
  const isWarning = route.params.aiResult === 'warning';
  const iconName = isApproved ? 'checkmark' : isWarning ? 'alert' : 'close';
  const title = isApproved
    ? 'Verified'
    : isWarning
      ? 'Needs Review'
      : 'Rejected';
  const subtitle = isApproved
    ? 'Verified successfully and saved to your feed.'
    : isWarning
      ? 'This proof is related, but not clear enough yet.'
      : 'This photo does not match the selected goal.';
  const confidence = checkIn?.aiConfidence ?? route.params.aiConfidence;

  function returnToFeed() {
    navigation.popToTop();
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate('Feed');
  }

  function retakePhoto() {
    navigation.replace('CheckIn', { goalId: route.params.goalId });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <View
          style={[
            styles.verifiedIcon,
            isWarning && styles.warningIcon,
            !isApproved && !isWarning && styles.rejectedIcon,
          ]}
        >
          <Ionicons color={colors.ink} name={iconName} size={46} />
        </View>
        <Text style={styles.eyebrow}>AI VERIFICATION</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.resultCard}>
          <Text style={styles.cardLabel}>GOAL</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalEmoji}>
              {checkIn?.categoryEmoji ?? goal?.categoryEmoji ?? '✨'}
            </Text>
            <Text style={styles.goalTitle}>
              {checkIn?.goalTitle ?? goal?.title ?? 'Goal'}
            </Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.cardLabel}>CONFIDENCE</Text>
          <Text style={styles.confidence}>{confidence}%</Text>
          <View style={styles.confidenceTrack}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${confidence}%` },
                isWarning && styles.warningFill,
                !isApproved && !isWarning && styles.rejectedFill,
              ]}
            />
          </View>
        </View>

        <View style={styles.notice}>
          <Ionicons
            color={colors.ink}
            name="information-circle-outline"
            size={18}
          />
          <Text style={styles.noticeText}>
            {checkIn?.aiFeedback ?? route.params.aiFeedback}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={isApproved ? returnToFeed : retakePhoto}
        style={({ pressed }) => [
          styles.feedButton,
          pressed && styles.feedButtonPressed,
        ]}
      >
        <Text style={styles.feedButtonText}>
          {isApproved
            ? 'Return to Feed'
            : isWarning
              ? 'Retake Proof'
              : 'Retake Required'}
        </Text>
        <Ionicons
          color={colors.ink}
          name={isApproved ? 'arrow-forward' : 'camera'}
          size={20}
        />
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
  warningIcon: {
    backgroundColor: colors.softOrange,
  },
  rejectedIcon: {
    backgroundColor: '#F5B8AE',
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
    textAlign: 'center',
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
  warningFill: {
    backgroundColor: colors.softOrange,
  },
  rejectedFill: {
    backgroundColor: '#E5695C',
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
