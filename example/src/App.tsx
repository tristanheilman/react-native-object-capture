import { StatusBar } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './HomeScreen';
import ObjectSessionScreen from './ObjectSessionScreen';
import ScanPassStageModal from './ScanPassStageModal';
import ObjectSessionHelpModal from './ObjectSessionHelpModal';
import PhotogrammetrySessionScreen from './PhotogrammetrySessionScreen';
import ModelOutputListScreen from './ModelOutputListScreen';
import ModelOutputScreen from './ModelOutputScreen';
import { colors } from './theme';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

// The capture flow's sheets can't be swiped away: each one is a decision point
// (next pass, flip, finish) that leaves the session waiting until it's made.
const decisionSheet = {
  headerShown: false,
  presentation: 'modal' as const,
  gestureEnabled: false,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShadowVisible: false,
            headerTintColor: colors.accent,
            headerTitleStyle: { color: colors.text },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ObjectCaptureView"
            component={ObjectSessionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ScanPassStageModal"
            component={ScanPassStageModal}
            options={decisionSheet}
          />
          <Stack.Screen
            name="ObjectSessionHelpModal"
            component={ObjectSessionHelpModal}
            options={decisionSheet}
          />
          <Stack.Screen
            name="PhotogrammetrySessionScreen"
            component={PhotogrammetrySessionScreen}
            options={decisionSheet}
          />
          <Stack.Screen
            name="ModelOutputListScreen"
            component={ModelOutputListScreen}
            options={{ title: 'Your Models', headerLargeTitle: true }}
          />
          <Stack.Screen
            name="ModelOutputScreen"
            component={ModelOutputScreen}
            options={{ title: '' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
