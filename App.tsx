import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/services/firebase';
import { AuthProvider } from './src/context/AuthContext';
import { CheckInProvider } from './src/context/CheckInContext';
import { FriendProvider } from './src/context/FriendContext';
import { GoalProvider } from './src/context/GoalContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GoalProvider>
          <CheckInProvider>
            <FriendProvider>
              <NavigationContainer>
                <StatusBar style="dark" />
                <RootNavigator />
              </NavigationContainer>
            </FriendProvider>
          </CheckInProvider>
        </GoalProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
