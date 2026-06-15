import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateGoalScreen } from '../screens/CreateGoalScreen';
import { FriendProfileScreen } from '../screens/FriendProfileScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { MyGoalsScreen } from '../screens/MyGoalsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProfileStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ProfileScreen} name="ProfileHome" />
      <Stack.Screen component={MyGoalsScreen} name="MyGoals" />
      <Stack.Screen component={CreateGoalScreen} name="CreateGoal" />
      <Stack.Screen component={FriendsScreen} name="Friends" />
      <Stack.Screen component={FriendProfileScreen} name="FriendProfile" />
      <Stack.Screen component={HistoryScreen} name="HistoryStats" />
    </Stack.Navigator>
  );
}
