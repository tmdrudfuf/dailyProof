import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii } from '../theme';

export function CameraScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Close camera" style={styles.topButton}>
          <Ionicons color={colors.surface} name="close" size={24} />
        </Pressable>
        <Text style={styles.title}>New proof</Text>
        <Pressable accessibilityLabel="Camera settings" style={styles.topButton}>
          <Ionicons color={colors.surface} name="flash-outline" size={21} />
        </Pressable>
      </View>

      <View style={styles.goalPill}>
        <View style={styles.goalIcon}>
          <Ionicons color={colors.ink} name="walk-outline" size={17} />
        </View>
        <View style={styles.goalCopy}>
          <Text style={styles.goalLabel}>PROVING TODAY</Text>
          <Text style={styles.goalTitle}>Morning movement</Text>
        </View>
        <Ionicons color="#A6AAA2" name="chevron-down" size={18} />
      </View>

      <View style={styles.viewfinder}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        <View style={styles.cameraHint}>
          <Ionicons color="#8B8F87" name="image-outline" size={40} />
          <Text style={styles.cameraHintTitle}>Show the work</Text>
          <Text style={styles.cameraHintText}>
            Your camera preview will appear here.
          </Text>
        </View>
        <View style={styles.timestamp}>
          <View style={styles.liveDot} />
          <Text style={styles.timestampText}>JUN 10 · 7:42 AM</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityLabel="Open photo library" style={styles.sideControl}>
          <Ionicons color={colors.surface} name="images-outline" size={23} />
        </Pressable>
        <Pressable
          accessibilityLabel="Take proof photo"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.captureButton,
            pressed && styles.captureButtonPressed,
          ]}
        >
          <View style={styles.captureInner} />
        </Pressable>
        <Pressable accessibilityLabel="Flip camera" style={styles.sideControl}>
          <Ionicons color={colors.surface} name="camera-reverse-outline" size={24} />
        </Pressable>
      </View>

      <Text style={styles.helper}>Tap once. Keep it honest.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#111310',
    flex: 1,
    paddingHorizontal: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingTop: 8,
  },
  topButton: {
    alignItems: 'center',
    backgroundColor: '#292C27',
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  title: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  goalPill: {
    alignItems: 'center',
    backgroundColor: '#292C27',
    borderRadius: radii.medium,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 11,
  },
  goalIcon: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  goalCopy: {
    flex: 1,
    marginLeft: 11,
  },
  goalLabel: {
    color: '#8F938B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  goalTitle: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  viewfinder: {
    alignItems: 'center',
    backgroundColor: '#20231E',
    borderRadius: radii.large,
    flex: 1,
    justifyContent: 'center',
    maxHeight: 500,
    minHeight: 330,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraHint: {
    alignItems: 'center',
  },
  cameraHintTitle: {
    color: '#B8BCB3',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  cameraHintText: {
    color: '#777B74',
    fontSize: 12,
    marginTop: 5,
  },
  corner: {
    borderColor: colors.accent,
    height: 30,
    position: 'absolute',
    width: 30,
  },
  topLeft: {
    borderLeftWidth: 2,
    borderTopWidth: 2,
    left: 20,
    top: 20,
  },
  topRight: {
    borderRightWidth: 2,
    borderTopWidth: 2,
    right: 20,
    top: 20,
  },
  bottomLeft: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    bottom: 20,
    left: 20,
  },
  bottomRight: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    bottom: 20,
    right: 20,
  },
  timestamp: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 19, 16, 0.8)',
    borderRadius: radii.pill,
    bottom: 18,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: 'absolute',
  },
  liveDot: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  timestampText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sideControl: {
    alignItems: 'center',
    backgroundColor: '#292C27',
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  captureButton: {
    alignItems: 'center',
    borderColor: colors.surface,
    borderRadius: 39,
    borderWidth: 3,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  captureButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  captureInner: {
    backgroundColor: colors.accent,
    borderRadius: 31,
    height: 62,
    width: 62,
  },
  helper: {
    color: '#777B74',
    fontSize: 11,
    paddingBottom: 8,
    paddingTop: 10,
    textAlign: 'center',
  },
});
