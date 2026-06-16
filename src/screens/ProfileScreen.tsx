import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { ProfileMenuItem } from '../components/ProfileMenuItem';
import { useAuth } from '../context/AuthContext';
import { useCheckIns } from '../context/CheckInContext';
import { useFriends } from '../context/FriendContext';
import { useGoals } from '../context/GoalContext';
import { colors, radii } from '../theme';
import { ProfileStackParamList } from '../types/navigation';

type ProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'ProfileHome'
>;

function getCurrentWeekDays() {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay() || 7;
  monday.setDate(today.getDate() - day + 1);

  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      label,
      key: getDateKey(date),
    };
  });
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalDateKey(value: string) {
  return getDateKey(new Date(value));
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { logout, profile } = useAuth();
  const { activeGoals } = useGoals();
  const { checkIns } = useCheckIns();
  const { friends } = useFriends();
  const displayName = profile?.displayName ?? 'DailyProof User';
  const username = profile?.username ?? '@yourname';
  const currentStreak = profile?.currentStreak ?? 0;
  const completedDateKeys = new Set(
    checkIns.map((checkIn) => getLocalDateKey(checkIn.createdAt))
  );
  const week = getCurrentWeekDays().map((item) => ({
    ...item,
    done: completedDateKeys.has(item.key),
  }));
  const weekProofs = week.filter((item) => item.done).length;
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const menuItems = [
    {
      label: 'My Goals',
      icon: 'flag-outline' as const,
      value: `${activeGoals.length} active`,
      onPress: () => navigation.navigate('MyGoals'),
    },
    {
      label: 'History & Stats',
      icon: 'time-outline' as const,
      value: `${checkIns.length} proofs`,
      onPress: () => navigation.navigate('HistoryStats'),
    },
    {
      label: 'Friends',
      icon: 'people-outline' as const,
      value: `${friends.length}`,
      onPress: () => navigation.navigate('Friends'),
    },
    { label: 'Settings', icon: 'settings-outline' as const },
    {
      label: 'Log Out',
      icon: 'log-out-outline' as const,
      onPress: () => {
        Alert.alert('Log out?', 'You can sign back in anytime.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => {
              void logout();
            },
          },
        ]);
      },
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Your proof.</Text>
          <Pressable accessibilityLabel="Edit profile" style={styles.editButton}>
            <Ionicons color={colors.ink} name="create-outline" size={20} />
          </Pressable>
        </View>

        <View style={styles.identity}>
          <Avatar initials={initials || 'DP'} size={82} />
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.handle}>{username}</Text>
            <Text style={styles.bio}>Doing the small things I said I would.</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{checkIns.length}</Text>
            <Text style={styles.statLabel}>PROOFS</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{friends.length}</Text>
            <Text style={styles.statLabel}>FRIENDS</Text>
          </View>
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <View>
              <Text style={styles.cardEyebrow}>THIS WEEK</Text>
              <Text style={styles.weekTitle}>
                {weekProofs} {weekProofs === 1 ? 'promise' : 'promises'} kept
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>
                {Math.round((weekProofs / 7) * 100)}%
              </Text>
            </View>
          </View>
          <View style={styles.days}>
            {week.map((item) => (
              <View key={item.key} style={styles.day}>
                <View style={[styles.dayDot, item.done && styles.dayDotDone]}>
                  {item.done ? (
                    <Ionicons color={colors.ink} name="checkmark" size={16} />
                  ) : null}
                </View>
                <Text style={styles.dayLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.menuTitle}>ACCOUNT</Text>
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <ProfileMenuItem
              icon={item.icon}
              isLast={index === menuItems.length - 1}
              key={item.label}
              label={item.label}
              onPress={item.onPress}
              value={item.value}
            />
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
  content: {
    paddingBottom: 34,
    paddingHorizontal: 18,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 30,
  },
  identityCopy: {
    flex: 1,
    marginLeft: 17,
  },
  name: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  handle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  bio: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 9,
  },
  stats: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radii.large,
    flexDirection: 'row',
    marginTop: 26,
    paddingVertical: 20,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: colors.surface,
    fontSize: 21,
    fontWeight: '900',
  },
  statLabel: {
    color: '#8E918A',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 5,
  },
  divider: {
    backgroundColor: '#3A3D38',
    height: 30,
    width: 1,
  },
  weekCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  weekHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardEyebrow: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  weekTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 5,
  },
  percentBadge: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  percentText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  day: {
    alignItems: 'center',
    gap: 7,
  },
  dayDot: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  dayDotDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  menuTitle: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 9,
    marginLeft: 4,
    marginTop: 26,
  },
  menu: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
