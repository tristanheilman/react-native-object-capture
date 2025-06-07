import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  ObjectCaptureView,
  type SessionState,
  type FeedbackState,
  type TrackingState,
  type SessionStateChange,
  type FeedbackStateChange,
  type TrackingStateChange,
  type SessionError,
  type CaptureComplete,
  type ScanPassCompleted,
} from 'react-native-object-capture';
import { objectCaptureViewRef } from './utils';
type ObjectSessionScreenProps = {
  navigation: any;
};

export default function ObjectSessionScreen({
  navigation,
}: ObjectSessionScreenProps) {
  const [sessionState, setSessionState] =
    useState<SessionState>('initializing');
  const [trackingState, setTrackingState] =
    useState<TrackingState>('notAvailable');
  const [feedbackState, setFeedbackState] = useState<FeedbackState[]>([]);
  const [numberOfScanPassCompleted, setNumberOfScanPassCompleted] = useState(0);

  const handleSessionStateChange = (
    event: NativeSyntheticEvent<SessionStateChange>
  ) => {
    console.log('Session state changed to:', event.nativeEvent);
    setSessionState(event.nativeEvent.state);
  };

  const handleFeedbackStateChange = (
    event: NativeSyntheticEvent<FeedbackStateChange>
  ) => {
    console.log('Feedback state changed to:', event.nativeEvent);
    setFeedbackState(event.nativeEvent.feedback);
  };

  const handleTrackingStateChange = (
    event: NativeSyntheticEvent<TrackingStateChange>
  ) => {
    console.log('Tracking state changed to:', event.nativeEvent);
    setTrackingState(event.nativeEvent.tracking);
  };

  const handleCaptureComplete = (
    event: NativeSyntheticEvent<CaptureComplete>
  ) => {
    console.log('Capture completed:', event.nativeEvent);
    //navigation.navigate('ScanPassStageModal');
  };

  const handleScanPassCompleted = (
    event: NativeSyntheticEvent<ScanPassCompleted>
  ) => {
    console.log('Scan pass completed:', event.nativeEvent);
    setNumberOfScanPassCompleted(numberOfScanPassCompleted + 1);
    objectCaptureViewRef.current?.pauseSession();
    navigation.navigate('ScanPassStageModal');
  };

  const handleError = (event: NativeSyntheticEvent<SessionError>) => {
    console.error('Error:', event.nativeEvent.error);
  };

  const handleStartDetection = async () => {
    await objectCaptureViewRef.current?.startDetection();
  };

  const handleResetDetection = async () => {
    await objectCaptureViewRef.current?.resetDetection();
  };

  const handleStartCapturing = async () => {
    await objectCaptureViewRef.current?.startCapturing();
  };

  const handleCancelSession = async () => {
    await objectCaptureViewRef.current?.cancelSession();
    navigation.goBack();
  };

  const showHelp = async () => {
    // pause the session
    await objectCaptureViewRef.current?.pauseSession();
    navigation.navigate('ObjectSessionHelpModal');
  };

  return (
    <View style={styles.container}>
      <ObjectCaptureView
        ref={objectCaptureViewRef}
        style={styles.container}
        onSessionStateChange={handleSessionStateChange}
        onFeedbackStateChange={handleFeedbackStateChange}
        onTrackingStateChange={handleTrackingStateChange}
        onScanPassCompleted={handleScanPassCompleted}
        onCaptureComplete={handleCaptureComplete}
        onError={handleError}
      />

      {feedbackState.length > 0 && (
        <View style={styles.feedbackContainer}>
          <Pressable
            style={styles.feedbackButton}
            onPress={handleCancelSession}
          >
            <Text style={styles.feedbackText}>{feedbackState.join(', ')}</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.trackingContainer}>
        <Pressable style={styles.trackingButton} onPress={handleCancelSession}>
          <Text style={styles.trackingText}>{trackingState}</Text>
        </Pressable>
      </View>

      <View style={styles.floatingBackButton}>
        <Pressable style={styles.button} onPress={handleCancelSession}>
          <Text>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.floatingHelpButton}>
        <Pressable style={styles.button} onPress={showHelp}>
          <Text>Help</Text>
        </Pressable>
      </View>

      <View style={styles.floatingContainer}>
        <View style={styles.buttonContainer}>
          {sessionState === 'initializing' && (
            <View style={styles.button}>
              <Text>Initializing...</Text>
            </View>
          )}
          {sessionState === 'ready' && (
            <Pressable style={styles.button} onPress={handleStartDetection}>
              <Text>Start Detection</Text>
            </Pressable>
          )}
          {sessionState === 'detecting' && (
            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={handleResetDetection}>
                <Text>Reset Detection</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={handleStartCapturing}>
                <Text>Start Capturing</Text>
              </Pressable>
            </View>
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
  feedbackButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 5,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 150,
    right: 50,
    left: 50,
    alignItems: 'center',
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
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    padding: 16,
  },
  floatingHelpButton: {
    position: 'absolute',
    top: 60,
    right: 0,
    padding: 16,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#ffffff',
  },
  trackingContainer: {
    position: 'absolute',
    bottom: 150,
    left: 50,
    right: 50,
    alignItems: 'center',
  },
  trackingButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 5,
  },
  trackingText: {
    color: '#ffffff',
  },
});
