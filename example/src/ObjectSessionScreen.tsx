import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ObjectCaptureView,
  type SessionState,
  type ObjectCaptureViewRef,
  type FeedbackState,
  type TrackingState,
} from 'react-native-object-capture';

type ObjectSessionScreenProps = {
  navigation: any;
};

export default function ObjectSessionScreen({
  navigation,
}: ObjectSessionScreenProps) {
  const objectCaptureViewRef = useRef<ObjectCaptureViewRef>(null);
  const [sessionState, setSessionState] =
    useState<SessionState>('initializing');
  const [trackingState, setTrackingState] =
    useState<TrackingState>('notAvailable');
  const [feedbackState, setFeedbackState] = useState<FeedbackState[]>([]);

  const handleSessionStateChange = (state: SessionState) => {
    setSessionState(state);
  };

  const handleFeedbackStateChange = (feedback: FeedbackState[]) => {
    setFeedbackState(feedback);
  };

  const handleTrackingStateChange = (tracking: TrackingState) => {
    setTrackingState(tracking);
  };

  const handleCaptureComplete = (result: { url: string }) => {
    console.log('Capture completed:', result.url);
  };

  const handleError = (error: { message: string }) => {
    console.error('Error:', error.message);
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

  const handleFinishSession = async () => {
    await objectCaptureViewRef.current?.finishSession();
  };

  const handleCancelSession = async () => {
    await objectCaptureViewRef.current?.cancelSession();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ObjectCaptureView
        ref={objectCaptureViewRef}
        style={styles.container}
        onSessionStateChange={handleSessionStateChange}
        onFeedbackStateChange={handleFeedbackStateChange}
        onTrackingStateChange={handleTrackingStateChange}
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
          {sessionState === 'capturing' && (
            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={handleResetDetection}>
                <Text>Reset Detection</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={handleFinishSession}>
                <Text>Finish Session</Text>
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
