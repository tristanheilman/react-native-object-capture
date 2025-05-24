import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import ObjectSessionScreen from './ObjectSessionScreen';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="ObjectCaptureView"
          component={ObjectSessionScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
