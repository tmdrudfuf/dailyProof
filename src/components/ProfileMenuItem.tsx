import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type ProfileMenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isLast?: boolean;
};

export function ProfileMenuItem({
  icon,
  label,
  value,
  isLast = false,
}: ProfileMenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.border,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.labelGroup}>
        <View style={styles.icon}>
          <Ionicons color={colors.ink} name={icon} size={19} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.trailing}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        <Ionicons color={colors.muted} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 62,
    paddingHorizontal: 12,
  },
  border: {
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
  },
  pressed: {
    opacity: 0.55,
  },
  labelGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  value: {
    color: colors.muted,
    fontSize: 13,
  },
});
