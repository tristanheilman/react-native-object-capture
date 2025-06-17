import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import ObjectSessionScreen from './ObjectSessionScreen';
import ScanPassStageModal from './ScanPassStageModal';
import ObjectSessionHelpModal from './ObjectSessionHelpModal';
import PhotogrammetrySessionScreen from './PhotogrammetrySessionScreen';
import ModelOutputListScreen from './ModelOutputListScreen';
import ModelOutputScreen from './ModelOutputScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="ObjectCaptureView"
          component={ObjectSessionScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ScanPassStageModal"
          component={ScanPassStageModal}
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="ObjectSessionHelpModal"
          component={ObjectSessionHelpModal}
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="PhotogrammetrySessionScreen"
          component={PhotogrammetrySessionScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="ModelOutputListScreen"
          component={ModelOutputListScreen}
        />
        <Stack.Screen name="ModelOutputScreen" component={ModelOutputScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
