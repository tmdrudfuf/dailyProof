import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type AvatarProps = {
  initials: string;
  size?: number;
  tone?: 'lime' | 'blue' | 'orange';
};

const tones = {
  lime: colors.softGreen,
  blue: colors.softBlue,
  orange: colors.softOrange,
};

export function Avatar({
  initials,
  size = 44,
  tone = 'lime',
}: AvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: tones[tone],
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
