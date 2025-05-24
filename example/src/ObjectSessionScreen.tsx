import { StyleSheet } from 'react-native';
import {
  ObjectCaptureView,
  type SessionState,
} from 'react-native-object-capture';

export default function ObjectSessionScreen() {
  const handleSessionStateChange = (state: SessionState) => {
    console.log('Session state:', state);
  };

  const handleCaptureComplete = (result: { url: string }) => {
    console.log('Capture completed:', result.url);
  };

  const handleError = (error: { message: string }) => {
    console.error('Error:', error.message);
  };

  return (
    <ObjectCaptureView
      style={styles.container}
      onSessionStateChange={handleSessionStateChange}
      onCaptureComplete={handleCaptureComplete}
      onError={handleError}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
