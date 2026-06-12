import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

import { CameraScreen } from '../screens/CameraScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { colors } from '../theme';
import { RootTabParamList } from '../types/navigation';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons = {
  Feed: { active: 'home' as const, inactive: 'home-outline' as const },
  Camera: { active: 'camera' as const, inactive: 'camera-outline' as const },
  Profile: { active: 'person' as const, inactive: 'person-outline' as const },
};

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: '#92958E',
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused }) => {
          const iconName = focused
            ? tabIcons[route.name].active
            : tabIcons[route.name].inactive;

          if (route.name === 'Camera') {
            return (
              <View style={styles.cameraTab}>
                <Ionicons color={colors.ink} name={iconName} size={25} />
              </View>
            );
          }

          return <Ionicons color={color} name={iconName} size={23} />;
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 72,
          paddingBottom: 9,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen component={FeedScreen} name="Feed" />
      <Tab.Screen component={CameraScreen} name="Camera" />
      <Tab.Screen component={ProfileNavigator} name="Profile" />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  cameraTab: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: colors.surface,
    borderRadius: 25,
    borderWidth: 4,
    height: 50,
    justifyContent: 'center',
    marginTop: -22,
    width: 50,
  },
});
