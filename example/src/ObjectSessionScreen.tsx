import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ObjectCaptureView,
  type SessionState,
  type ObjectCaptureViewRef,
} from 'react-native-object-capture';

export default function ObjectSessionScreen() {
  const objectCaptureViewRef = useRef<ObjectCaptureViewRef>(null);
  const [sessionState, setSessionState] =
    useState<SessionState>('initializing');

  const handleSessionStateChange = (state: SessionState) => {
    console.log('Session state:', state);
    console.log('Object capture view ref:', objectCaptureViewRef.current);
    setSessionState(state);
  };

  const handleCaptureComplete = (result: { url: string }) => {
    console.log('Capture completed:', result.url);
  };

  const handleError = (error: { message: string }) => {
    console.error('Error:', error.message);
  };

  return (
    <View style={styles.container}>
      <ObjectCaptureView
        ref={objectCaptureViewRef}
        style={styles.container}
        onSessionStateChange={handleSessionStateChange}
        onCaptureComplete={handleCaptureComplete}
        onError={handleError}
      />

      <View style={styles.floatingContainer}>
        <View style={styles.buttonContainer}>
          {sessionState === 'initializing' && (
            <View style={styles.button}>
              <Text>Initializing...</Text>
            </View>
          )}
          {sessionState === 'ready' && (
            <Pressable
              style={styles.button}
              onPress={() => {
                //setSessionState('capturing');
              }}
            >
              <Text>Start Session</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#CD8987',
    borderRadius: 5,
  },
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: 30,
    paddingTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
