import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCheckIns } from '../context/CheckInContext';
import { useGoals } from '../context/GoalContext';
import { persistCheckInPhoto } from '../services/photoStorage';
import { colors, radii } from '../theme';
import { CameraStackParamList } from '../types/navigation';

type CheckInScreenProps = NativeStackScreenProps<
  CameraStackParamList,
  'CheckIn'
>;

export function CheckInScreen({
  navigation,
  route,
}: CheckInScreenProps) {
  const { goals } = useGoals();
  const { hasCheckedInToday, submitCheckIn } = useCheckIns();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const goal = goals.find((item) => item.id === route.params.goalId);
  const provedToday = goal ? hasCheckedInToday(goal.id) : false;

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text style={styles.stateTitle}>Goal not found.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.stateButton}>
            <Text style={styles.stateButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleSubmit() {
    if (!photoUri || isSubmitting || !goal) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const storedPhotoUri = await persistCheckInPhoto(photoUri);
      const checkIn = await submitCheckIn(goal, storedPhotoUri);
      navigation.replace('CheckInResult', { checkInId: checkIn.id });
    } catch {
      setSubmitError(
        'Your check-in could not be saved. Check your connection and try again.'
      );
      setIsSubmitting(false);
    }
  }

  function renderCamera() {
    if (!goal) {
      return null;
    }

    if (!permission) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.stateText}>Checking camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centeredState}>
          <View style={styles.permissionIcon}>
            <Ionicons color={colors.ink} name="camera-outline" size={34} />
          </View>
          <Text style={styles.stateTitle}>Camera access is required</Text>
          <Text style={styles.stateText}>
            DailyProof needs camera permission to capture proof photos. Gallery
            uploads are not available.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.cameraShell}>
        <View style={styles.cameraViewport}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraOverlay}>
            <View style={styles.goalPill}>
              <Text style={styles.goalPillEmoji}>{goal.categoryEmoji}</Text>
              <Text numberOfLines={1} style={styles.goalPillText}>
                {goal.title}
              </Text>
            </View>
            <View style={styles.guideFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.cameraHint}>Frame the action that proves it.</Text>
          </View>
        </View>

        <View style={styles.captureControls}>
          <Pressable
            accessibilityLabel="Take proof photo"
            accessibilityRole="button"
            disabled={isCapturing}
            onPress={handleCapture}
            style={({ pressed }) => [
              styles.captureButton,
              pressed && styles.captureButtonPressed,
            ]}
          >
            <View style={styles.captureInner}>
              {isCapturing ? (
                <ActivityIndicator color={colors.ink} />
              ) : null}
            </View>
          </Pressable>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>
          {photoUri ? 'Preview' : 'Take Proof'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {provedToday ? (
        <View style={styles.alreadyProvedNotice}>
          <Ionicons
            color={colors.ink}
            name="checkmark-circle-outline"
            size={20}
          />
          <Text style={styles.alreadyProvedText}>
            Already proved today. Another check-in will be added to the feed,
            but completed days will not increase again.
          </Text>
        </View>
      ) : null}

      {photoUri ? (
        <View style={styles.previewContent}>
          <View style={styles.selectedGoal}>
            <Text style={styles.selectedGoalEmoji}>{goal.categoryEmoji}</Text>
            <View style={styles.selectedGoalCopy}>
              <Text style={styles.selectedGoalLabel}>SELECTED GOAL</Text>
              <Text style={styles.selectedGoalTitle}>{goal.title}</Text>
            </View>
          </View>

          <View style={styles.previewFrame}>
            <Image
              accessibilityLabel="Captured proof preview"
              resizeMode="cover"
              source={{ uri: photoUri }}
              style={styles.previewImage}
            />
            <View style={styles.photoStamp}>
              <View style={styles.liveDot} />
              <Text style={styles.photoStampText}>CAPTURED PROOF</Text>
            </View>
          </View>

          <View style={styles.previewActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => setPhotoUri(null)}
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
              {isSubmitting ? (
                <ActivityIndicator color={colors.ink} size="small" />
              ) : (
                <>
                  <Text style={styles.submitText}>Submit</Text>
                  <Ionicons color={colors.ink} name="arrow-forward" size={19} />
                </>
              )}
            </Pressable>
          </View>
          {submitError ? (
            <Text style={styles.submitError}>{submitError}</Text>
          ) : null}
        </View>
      ) : (
        renderCamera()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#111310',
    flex: 1,
  },
  submitError: {
    color: '#A23A32',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12,
    textAlign: 'center',
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
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
  alreadyProvedNotice: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderBottomColor: colors.accentDark,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  alreadyProvedText: {
    color: colors.ink,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  centeredState: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 34,
  },
  permissionIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 31,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  stateTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 16,
    textAlign: 'center',
  },
  stateText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  stateButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  stateButtonText: {
    color: colors.ink,
    fontWeight: '900',
  },
  permissionButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    marginTop: 20,
    minWidth: 180,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  permissionButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  cameraShell: {
    flex: 1,
  },
  cameraViewport: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 18,
  },
  goalPill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(17, 19, 16, 0.78)',
    borderRadius: radii.pill,
    flexDirection: 'row',
    maxWidth: '90%',
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  goalPillEmoji: {
    fontSize: 17,
  },
  goalPillText: {
    color: colors.surface,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 7,
  },
  guideFrame: {
    flex: 1,
    marginVertical: 24,
    position: 'relative',
  },
  corner: {
    borderColor: colors.accent,
    height: 32,
    position: 'absolute',
    width: 32,
  },
  topLeft: {
    borderLeftWidth: 2,
    borderTopWidth: 2,
    left: 0,
    top: 0,
  },
  topRight: {
    borderRightWidth: 2,
    borderTopWidth: 2,
    right: 0,
    top: 0,
  },
  bottomLeft: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    bottom: 0,
    right: 0,
  },
  cameraHint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(17, 19, 16, 0.72)',
    borderRadius: radii.pill,
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  captureControls: {
    alignItems: 'center',
    backgroundColor: '#111310',
    justifyContent: 'center',
    minHeight: 118,
  },
  captureButton: {
    alignItems: 'center',
    borderColor: colors.surface,
    borderRadius: 40,
    borderWidth: 3,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  captureButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  captureInner: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  previewContent: {
    backgroundColor: colors.background,
    flex: 1,
    paddingBottom: 16,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  selectedGoal: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 11,
  },
  selectedGoalEmoji: {
    fontSize: 24,
    marginHorizontal: 7,
  },
  selectedGoalCopy: {
    flex: 1,
    marginLeft: 8,
  },
  selectedGoalLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  selectedGoalTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  previewFrame: {
    backgroundColor: colors.dark,
    borderRadius: radii.large,
    flex: 1,
    marginTop: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  photoStamp: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 19, 16, 0.82)',
    borderRadius: radii.pill,
    bottom: 16,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 16,
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
  previewActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
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
});
