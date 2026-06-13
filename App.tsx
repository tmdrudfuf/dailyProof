import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/services/firebase';
import { AppNavigator } from './src/navigation/AppNavigator';
import { CheckInProvider } from './src/context/CheckInContext';
import { FriendProvider } from './src/context/FriendContext';
import { GoalProvider } from './src/context/GoalContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <GoalProvider>
        <CheckInProvider>
          <FriendProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <AppNavigator />
            </NavigationContainer>
          </FriendProvider>
        </CheckInProvider>
      </GoalProvider>
    </SafeAreaProvider>
  );
}
