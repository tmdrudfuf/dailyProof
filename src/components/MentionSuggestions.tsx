import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii } from '../theme';
import { Friend } from '../types/friend';

type MentionSuggestionsProps = {
  friends: Friend[];
  query: string;
  onSelect: (friend: Friend) => void;
};

function normalizeUsername(username: string) {
  return username.startsWith('@') ? username : `@${username}`;
}

export function getActiveMentionQuery(text: string) {
  const match = text.match(/(^|\s)@([^\s@]*)$/);
  return match ? match[2].toLowerCase() : null;
}

export function insertMention(text: string, username: string) {
  const mention = normalizeUsername(username);
  return text.replace(/(^|\s)@[^\s@]*$/, (match, prefix: string) => {
    return `${prefix}${mention} `;
  });
}

export function MentionSuggestions({
  friends,
  query,
  onSelect,
}: MentionSuggestionsProps) {
  const normalizedQuery = query.toLowerCase();
  const suggestions = friends
    .filter((friend) => {
      const username = friend.username.toLowerCase().replace(/^@/, '');
      const displayName = friend.displayName.toLowerCase();

      return (
        normalizedQuery.length === 0 ||
        username.includes(normalizedQuery) ||
        displayName.includes(normalizedQuery)
      );
    })
    .slice(0, 6);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>MENTION A FRIEND</Text>
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.list}>
          {suggestions.map((friend) => (
            <Pressable
              accessibilityLabel={`Mention ${friend.displayName}`}
              accessibilityRole="button"
              key={friend.id}
              onPress={() => onSelect(friend)}
              style={styles.item}
            >
              <View style={styles.avatar}>
                <Text style={styles.initial}>
                  {friend.displayName.slice(0, 1)}
                </Text>
              </View>
              <View>
                <Text style={styles.name}>{friend.displayName}</Text>
                <Text style={styles.username}>{normalizeUsername(friend.username)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  label: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 7,
  },
  list: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  initial: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  name: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  username: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
});
