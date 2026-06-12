import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { useFriends } from '../context/FriendContext';
import { colors, radii } from '../theme';
import { Friend } from '../types/friend';
import { ProfileStackParamList } from '../types/navigation';

type FriendsScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'Friends'
>;

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function FriendRow({
  friend,
  isRequest = false,
}: {
  friend: Friend;
  isRequest?: boolean;
}) {
  return (
    <View style={styles.friendRow}>
      <Avatar
        initials={getInitials(friend.displayName)}
        size={48}
        tone={isRequest ? 'blue' : 'lime'}
      />
      <View style={styles.friendCopy}>
        <Text style={styles.friendName}>{friend.displayName}</Text>
        <Text style={styles.username}>{friend.username}</Text>
      </View>
      {isRequest ? (
        <View style={styles.requestBadge}>
          <Text style={styles.requestText}>PENDING</Text>
        </View>
      ) : (
        <View style={styles.streak}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{friend.currentStreak}</Text>
        </View>
      )}
    </View>
  );
}

export function FriendsScreen({ navigation }: FriendsScreenProps) {
  const { friends, friendRequests } = useFriends();
  const [query, setQuery] = useState('');

  const filteredFriends = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return friends;
    }

    return friends.filter(
      (friend) =>
        friend.displayName.toLowerCase().includes(normalizedQuery) ||
        friend.username.toLowerCase().includes(normalizedQuery)
    );
  }, [friends, query]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to profile"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons color={colors.ink} name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.title}>Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.search}>
          <Ionicons color={colors.muted} name="search" size={19} />
          <TextInput
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search friends"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CURRENT FRIENDS</Text>
          <Text style={styles.sectionCount}>{friends.length}</Text>
        </View>
        <View style={styles.card}>
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendRow friend={friend} key={friend.id} />
            ))
          ) : (
            <Text style={styles.emptyText}>No friends match your search.</Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FRIEND REQUESTS</Text>
          <Text style={styles.sectionCount}>{friendRequests.length}</Text>
        </View>
        <View style={styles.card}>
          {friendRequests.map((friend) => (
            <FriendRow friend={friend} isRequest key={friend.id} />
          ))}
        </View>
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
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingBottom: 36,
    paddingHorizontal: 18,
  },
  search: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 15,
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    height: 50,
    marginLeft: 10,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
    marginTop: 26,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionCount: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  friendRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 76,
    paddingHorizontal: 16,
  },
  friendCopy: {
    flex: 1,
    marginLeft: 13,
  },
  friendName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  username: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  streak: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  streakEmoji: {
    fontSize: 13,
  },
  streakText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  requestBadge: {
    backgroundColor: colors.softBlue,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  requestText: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    padding: 20,
    textAlign: 'center',
  },
});
