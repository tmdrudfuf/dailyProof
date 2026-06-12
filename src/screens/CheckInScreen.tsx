import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCheckIns } from '../context/CheckInContext';
import { useGoals } from '../context/GoalContext';
import { colors, radii } from '../theme';
import { CameraStackParamList } from '../types/navigation';

type CheckInScreenProps = NativeStackScreenProps<
  CameraStackParamList,
  'CheckIn'
>;

const MOCK_PHOTO_URL = 'mock://dailyproof/check-in-photo';

export function CheckInScreen({
  navigation,
  route,
}: CheckInScreenProps) {
  const { goals } = useGoals();
  const { hasCheckedInToday, submitCheckIn } = useCheckIns();
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const goal = goals.find((item) => item.id === route.params.goalId);
  const provedToday = goal ? hasCheckedInToday(goal.id) : false;

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingState}>
          <Text style={styles.missingTitle}>Goal not found.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.simpleButton}>
            <Text style={styles.simpleButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function handleSubmit() {
    if (!hasPhoto || isSubmitting || !goal) {
      return;
    }

    setIsSubmitting(true);
    const checkIn = submitCheckIn(goal, MOCK_PHOTO_URL);
    navigation.replace('CheckInResult', { checkInId: checkIn.id });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Back to goals"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons color={colors.ink} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Check In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>SELECTED GOAL</Text>
        <View style={styles.selectedGoal}>
          <View style={styles.goalEmoji}>
            <Text style={styles.goalEmojiText}>{goal.categoryEmoji}</Text>
          </View>
          <View>
            <Text style={styles.goalCategory}>{goal.category}</Text>
            <Text style={styles.goalTitle}>{goal.title}</Text>
          </View>
        </View>

        {provedToday ? (
          <View style={styles.alreadyProvedNotice}>
            <Ionicons
              color={colors.ink}
              name="checkmark-circle-outline"
              size={20}
            />
            <Text style={styles.alreadyProvedText}>
              You already proved this goal today. Another check-in will appear
              in the feed, but completed days will not increase again.
            </Text>
          </View>
        ) : null}

        <View style={[styles.photoCard, hasPhoto && styles.photoCardSelected]}>
          {hasPhoto ? (
            <>
              <View style={styles.mockScene}>
                <View style={styles.mockSun} />
                <View style={styles.mockGround} />
                <Text style={styles.mockEmoji}>{goal.categoryEmoji}</Text>
              </View>
              <View style={styles.photoStamp}>
                <View style={styles.liveDot} />
                <Text style={styles.photoStampText}>MOCK PROOF</Text>
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.placeholderIcon}>
                <Ionicons color={colors.ink} name="image-outline" size={32} />
              </View>
              <Text style={styles.placeholderTitle}>No mock photo selected</Text>
              <Text style={styles.placeholderText}>
                This simulates photo capture without using your camera.
              </Text>
            </View>
          )}
        </View>

        {!hasPhoto ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setHasPhoto(true)}
            style={({ pressed }) => [
              styles.selectButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons color={colors.ink} name="images-outline" size={20} />
            <Text style={styles.selectButtonText}>Select Mock Photo</Text>
          </Pressable>
        ) : (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setHasPhoto(false)}
              style={({ pressed }) => [
                styles.retakeButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons color={colors.ink} name="refresh" size={19} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
              <Ionicons color={colors.ink} name="arrow-forward" size={19} />
            </Pressable>
          </View>
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
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
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
  content: {
    paddingBottom: 30,
    paddingHorizontal: 18,
    paddingTop: 26,
  },
  label: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginLeft: 3,
  },
  selectedGoal: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 9,
    padding: 13,
  },
  alreadyProvedNotice: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderColor: colors.accentDark,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
    padding: 13,
  },
  alreadyProvedText: {
    color: colors.ink,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  goalEmoji: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    marginRight: 12,
    width: 46,
  },
  goalEmojiText: {
    fontSize: 22,
  },
  goalCategory: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  goalTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  photoCard: {
    alignItems: 'center',
    aspectRatio: 0.86,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    justifyContent: 'center',
    marginTop: 18,
    maxHeight: 470,
    overflow: 'hidden',
    position: 'relative',
  },
  photoCardSelected: {
    borderStyle: 'solid',
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  placeholderIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  placeholderTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 16,
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },
  mockScene: {
    alignItems: 'center',
    backgroundColor: colors.softBlue,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  mockSun: {
    backgroundColor: '#FFE173',
    borderRadius: 44,
    height: 88,
    position: 'absolute',
    right: 34,
    top: 42,
    width: 88,
  },
  mockGround: {
    backgroundColor: colors.softGreen,
    bottom: -50,
    height: '44%',
    position: 'absolute',
    transform: [{ rotate: '-7deg' }],
    width: '120%',
  },
  mockEmoji: {
    fontSize: 78,
    zIndex: 1,
  },
  photoStamp: {
    alignItems: 'center',
    backgroundColor: 'rgba(23, 24, 21, 0.82)',
    borderRadius: radii.pill,
    bottom: 16,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
  },
  liveDot: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  photoStampText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  selectButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 54,
  },
  selectButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  retakeButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 54,
  },
  retakeText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    flex: 1.5,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 54,
  },
  submitText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.99 }],
  },
  missingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  missingTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  simpleButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  simpleButtonText: {
    color: colors.ink,
    fontWeight: '900',
  },
});
