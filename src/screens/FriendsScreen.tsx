import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

function PersonRow({
  friend,
  actions,
}: {
  friend: Friend;
  actions?: ReactNode;
}) {
  return (
    <View style={styles.friendRow}>
      <Avatar initials={getInitials(friend.displayName)} size={48} tone="lime" />
      <View style={styles.friendCopy}>
        <Text style={styles.friendName}>{friend.displayName}</Text>
        <Text style={styles.username}>{friend.username}</Text>
      </View>
      {actions}
    </View>
  );
}

export function FriendsScreen({ navigation }: FriendsScreenProps) {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchResults,
    isLoading,
    isSearching,
    actionUserId,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshFriends,
  } = useFriends();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      void searchUsers(query);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, searchUsers]);

  const friendIds = useMemo(
    () => new Set(friends.map((friend) => friend.id)),
    [friends]
  );
  const outgoingIds = useMemo(
    () => new Set(outgoingRequests.map((request) => request.user.id)),
    [outgoingRequests]
  );
  const incomingIds = useMemo(
    () => new Set(incomingRequests.map((request) => request.user.id)),
    [incomingRequests]
  );

  function confirmRemove(friend: Friend) {
    Alert.alert(
      'Remove friend?',
      `${friend.displayName} will no longer appear in your friend feed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => void removeFriend(friend.friendshipId),
        },
      ]
    );
  }

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
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void refreshFriends()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SEARCH</Text>
        </View>
        <View style={styles.search}>
          <Ionicons color={colors.muted} name="search" size={19} />
          <TextInput
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search name or username"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={query}
          />
          {isSearching ? (
            <ActivityIndicator color={colors.ink} size="small" />
          ) : null}
        </View>

        {query.trim() ? (
          <View style={[styles.card, styles.searchResults]}>
            {searchResults.length > 0 ? (
              searchResults.map((user) => {
                const isFriend = friendIds.has(user.id);
                const isOutgoing = outgoingIds.has(user.id);
                const isIncoming = incomingIds.has(user.id);
                const isWorking = actionUserId === user.id;

                return (
                  <PersonRow
                    friend={user}
                    key={user.id}
                    actions={
                      <Pressable
                        disabled={
                          isFriend || isOutgoing || isIncoming || isWorking
                        }
                        onPress={() => void sendFriendRequest(user.id)}
                        style={[
                          styles.primaryButton,
                          (isFriend || isOutgoing || isIncoming) &&
                            styles.disabledButton,
                        ]}
                      >
                        {isWorking ? (
                          <ActivityIndicator color={colors.ink} size="small" />
                        ) : (
                          <Text style={styles.primaryButtonText}>
                            {isFriend
                              ? 'Friends'
                              : isOutgoing
                                ? 'Sent'
                                : isIncoming
                                  ? 'Respond below'
                                  : 'Add Friend'}
                          </Text>
                        )}
                      </Pressable>
                    }
                  />
                );
              })
            ) : !isSearching ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>INCOMING REQUESTS</Text>
          <Text style={styles.sectionCount}>{incomingRequests.length}</Text>
        </View>
        <View style={styles.card}>
          {incomingRequests.length > 0 ? (
            incomingRequests.map(({ friendship, user }) => {
              const isWorking = actionUserId === friendship.id;
              return (
                <PersonRow
                  friend={user}
                  key={friendship.id}
                  actions={
                    <View style={styles.requestActions}>
                      <Pressable
                        disabled={isWorking}
                        onPress={() =>
                          void declineFriendRequest(friendship.id)
                        }
                        style={styles.iconAction}
                      >
                        <Ionicons color={colors.muted} name="close" size={19} />
                      </Pressable>
                      <Pressable
                        disabled={isWorking}
                        onPress={() =>
                          void acceptFriendRequest(friendship.id)
                        }
                        style={styles.acceptAction}
                      >
                        {isWorking ? (
                          <ActivityIndicator color={colors.ink} size="small" />
                        ) : (
                          <Ionicons
                            color={colors.ink}
                            name="checkmark"
                            size={19}
                          />
                        )}
                      </Pressable>
                    </View>
                  }
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>No incoming requests.</Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CURRENT FRIENDS</Text>
          <Text style={styles.sectionCount}>{friends.length}</Text>
        </View>
        <View style={styles.card}>
          {isLoading && friends.length === 0 ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={colors.ink} />
              <Text style={styles.emptyText}>Loading friends...</Text>
            </View>
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <PersonRow
                friend={friend}
                key={friend.id}
                actions={
                  <View style={styles.friendActions}>
                    <View style={styles.streak}>
                      <Text style={styles.streakEmoji}>🔥</Text>
                      <Text style={styles.streakText}>
                        {friend.currentStreak}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel={`Remove ${friend.displayName}`}
                      onPress={() => confirmRemove(friend)}
                      style={styles.removeButton}
                    >
                      <Ionicons
                        color={colors.muted}
                        name="person-remove-outline"
                        size={18}
                      />
                    </Pressable>
                  </View>
                }
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              Search for someone to add your first friend.
            </Text>
          )}
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
  errorBanner: {
    alignItems: 'center',
    backgroundColor: '#FBE9E6',
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    padding: 13,
  },
  errorText: {
    color: '#8E342D',
    flex: 1,
    fontSize: 12,
  },
  retryText: {
    color: '#8E342D',
    fontSize: 12,
    fontWeight: '900',
  },
  search: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    height: 50,
    marginLeft: 10,
  },
  searchResults: {
    marginTop: 10,
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
    paddingHorizontal: 14,
  },
  friendCopy: {
    flex: 1,
    marginLeft: 12,
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 88,
    paddingHorizontal: 12,
  },
  disabledButton: {
    backgroundColor: colors.line,
  },
  primaryButtonText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 7,
  },
  iconAction: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  acceptAction: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  friendActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  streak: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
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
  removeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 32,
  },
  loadingState: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 18,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    padding: 20,
    textAlign: 'center',
  },
});
