import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { CheckInProvider } from './src/context/CheckInContext';
import { GoalProvider } from './src/context/GoalContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <GoalProvider>
        <CheckInProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </CheckInProvider>
      </GoalProvider>
    </SafeAreaProvider>
  );
}
