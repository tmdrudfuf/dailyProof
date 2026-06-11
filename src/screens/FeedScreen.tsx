import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { FeedCard } from '../components/FeedCard';
import { mockFeedPosts } from '../services/mockFeed';
import { colors, radii } from '../theme';

export function FeedScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={mockFeedPosts}
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
                <Text style={styles.todayTitle}>One promise.{'\n'}Make it visible.</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={styles.progressFill} />
                  </View>
                  <Text style={styles.progressText}>1 of 2</Text>
                </View>
              </View>
              <View style={styles.checkMark}>
                <Ionicons color={colors.ink} name="checkmark" size={28} />
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
          </>
        }
        renderItem={({ item }) => <FeedCard post={item} />}
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
    width: '50%',
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
});
