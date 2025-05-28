import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import ObjectSessionScreen from './ObjectSessionScreen';
import ScanPassStageModal from './ScanPassStageModal';
import ObjectSessionHelpModal from './ObjectSessionHelpModal';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
