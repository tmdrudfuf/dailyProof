import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CameraScreen } from '../screens/CameraScreen';
import { CheckInResultScreen } from '../screens/CheckInResultScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { CameraStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<CameraStackParamList>();

export function CameraNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={CameraScreen} name="CameraGoals" />
      <Stack.Screen component={CheckInScreen} name="CheckIn" />
      <Stack.Screen component={CheckInResultScreen} name="CheckInResult" />
    </Stack.Navigator>
  );
}
