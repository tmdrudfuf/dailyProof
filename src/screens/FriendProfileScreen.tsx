import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { useFriends } from '../context/FriendContext';
import { colors, radii } from '../theme';
import { ProfileStackParamList } from '../types/navigation';

type FriendProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'FriendProfile'
>;

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DP'
  );
}

export function FriendProfileScreen({
  navigation,
  route,
}: FriendProfileScreenProps) {
  const { friends } = useFriends();
  const friend = friends.find((item) => item.id === route.params.friendId);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons color={colors.ink} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {friend ? (
          <>
            <View style={styles.profileCard}>
              <Avatar initials={getInitials(friend.displayName)} size={78} />
              <Text style={styles.displayName}>{friend.displayName}</Text>
              <Text style={styles.username}>{friend.username}</Text>
              <View style={styles.friendBadge}>
                <Ionicons color={colors.ink} name="people" size={15} />
                <Text style={styles.friendBadgeText}>Friend</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{friend.currentStreak}</Text>
                <Text style={styles.statLabel}>Current streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Friends</Text>
                <Text style={styles.statLabel}>Visibility allowed</Text>
              </View>
            </View>

            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>Recent proofs</Text>
              <Text style={styles.placeholderText}>
                Friend profile feed will live here later.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.profileCard}>
            <Ionicons color={colors.muted} name="person-circle-outline" size={58} />
            <Text style={styles.displayName}>Friend not found</Text>
            <Text style={styles.placeholderText}>
              This profile is not in your current friends list.
            </Text>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    padding: 24,
  },
  displayName: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 14,
  },
  username: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  friendBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  friendBadgeText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  statsCard: {
    backgroundColor: colors.dark,
    borderRadius: radii.large,
    flexDirection: 'row',
    marginTop: 14,
    padding: 18,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#AEB2A9',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  statDivider: {
    backgroundColor: '#454842',
    marginHorizontal: 15,
    width: 1,
  },
  placeholderCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 14,
    padding: 18,
  },
  placeholderTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },
});
