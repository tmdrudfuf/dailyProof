import { StyleProp, Text, TextStyle } from 'react-native';

import { colors } from '../theme';
import { Friend } from '../types/friend';

type MentionTextProps = {
  friends: Friend[];
  onPressMention?: (friend: Friend) => void;
  style?: StyleProp<TextStyle>;
  text: string;
};

function normalizeUsername(username: string) {
  return username.replace(/^@/, '').toLowerCase();
}

export function MentionText({
  friends,
  onPressMention,
  style,
  text,
}: MentionTextProps) {
  const friendByUsername = new Map(
    friends.map((friend) => [normalizeUsername(friend.username), friend])
  );
  const parts = text.split(/(@[A-Za-z0-9_.]+)/g);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (!part.startsWith('@')) {
          return <Text key={`${part}-${index}`}>{part}</Text>;
        }

        const friend = friendByUsername.get(normalizeUsername(part));

        return (
          <Text
            key={`${part}-${index}`}
            onPress={friend ? () => onPressMention?.(friend) : undefined}
            style={styles.mention}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = {
  mention: {
    color: colors.accentDark,
    fontWeight: '900' as const,
  },
};
