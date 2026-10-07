import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ObjectCaptureSession,
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
import { Button, IconButton, Pill } from './ui';
import { feedbackLabels, stateHint, trackingLabels } from './labels';
import { colors, radius, RECOMMENDED_PASSES, spacing, type } from './theme';

type ObjectSessionScreenProps = {
  navigation: any;
};

export default function ObjectSessionScreen({
  navigation,
}: ObjectSessionScreenProps) {
  const insets = useSafeAreaInsets();
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
  };

  const handleScanPassCompleted = (
    event: NativeSyntheticEvent<ScanPassCompleted>
  ) => {
    console.log('Scan pass completed:', event.nativeEvent);
    // Fires on every change to the flag, including the reset to false that
    // beginNewScan / beginNewScanAfterFlip cause. Only a completed pass should
    // open the modal - reopening it on the reset invites a second
    // beginNewScan outside the capturing state.
    if (!event.nativeEvent.completed) return;
    setNumberOfScanPassCompleted(numberOfScanPassCompleted + 1);
    ObjectCaptureSession.pauseSession();
    navigation.navigate('ScanPassStageModal');
  };

  const handleError = (event: NativeSyntheticEvent<SessionError>) => {
    console.error('Error:', event.nativeEvent.error);
  };

  const handleStartDetection = async () => {
    await ObjectCaptureSession.startDetection();
  };

  const handleResetDetection = async () => {
    await ObjectCaptureSession.resetDetection();
  };

  const handleStartCapturing = async () => {
    await ObjectCaptureSession.startCapturing();
  };

  const handleCancelSession = async () => {
    await ObjectCaptureSession.cancelSession();
    navigation.goBack();
  };

  const showHelp = async () => {
    await ObjectCaptureSession.pauseSession();
    navigation.navigate('ObjectSessionHelpModal');
  };

  const currentPass = numberOfScanPassCompleted + 1;
  // Three is a recommendation, not a cap - keep counting past it.
  const totalPasses = Math.max(RECOMMENDED_PASSES, currentPass);
  const capturing = sessionState === 'capturing';
  // Show at most two hints at once; RealityKit can report several together.
  const feedback = feedbackState
    .slice(0, 2)
    .map((f) => feedbackLabels[f])
    .join(' · ');

  return (
    <View style={styles.container}>
      <ObjectCaptureView
        style={styles.container}
        checkpointDirectory={'Snapshots/'}
        imagesDirectory={'Images/'}
        onSessionStateChange={handleSessionStateChange}
        onFeedbackStateChange={handleFeedbackStateChange}
        onTrackingStateChange={handleTrackingStateChange}
        onScanPassCompleted={handleScanPassCompleted}
        onCaptureComplete={handleCaptureComplete}
        onError={handleError}
      />

      <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
        <IconButton
          glyph="✕"
          accessibilityLabel="Cancel scan"
          onPress={handleCancelSession}
        />
        <View style={styles.passIndicator}>
          <Text style={styles.passLabel}>
            Pass {currentPass} of {totalPasses}
          </Text>
          <View style={styles.passDots}>
            {Array.from({ length: totalPasses }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.passDot,
                  i < numberOfScanPassCompleted && styles.passDotDone,
                  i === numberOfScanPassCompleted && styles.passDotCurrent,
                ]}
              />
            ))}
          </View>
        </View>
        <IconButton
          glyph="?"
          accessibilityLabel="Scanning tips"
          onPress={showHelp}
        />
      </View>

      <View style={[styles.hints, { top: insets.top + 68 }]}>
        {feedback.length > 0 && <Pill label={feedback} tone="warning" />}
        {trackingState === 'limited' && (
          <Pill label={trackingLabels.limited} tone="warning" />
        )}
        {/* While capturing, the panel steps aside for RealityKit's capture
            ring, so its instruction moves up here. */}
        {capturing && feedback.length === 0 && (
          <Pill label={stateHint('capturing')} />
        )}
      </View>

      {!capturing && (
        <View
          style={[styles.panel, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <Text style={styles.panelHint}>{stateHint(sessionState)}</Text>
          {sessionState === 'initializing' && (
            <ActivityIndicator color={colors.text} style={styles.spinner} />
          )}
          {sessionState === 'ready' && (
            <Button label="Start Detection" onPress={handleStartDetection} />
          )}
          {sessionState === 'detecting' && (
            <View style={styles.buttonRow}>
              <Button
                label="Reset"
                variant="secondary"
                onPress={handleResetDetection}
                style={styles.secondaryAction}
              />
              <Button
                label="Start Capturing"
                onPress={handleStartCapturing}
                style={styles.primaryAction}
              />
            </View>
          )}
          {sessionState === 'failed' && (
            <Button
              label="Close"
              variant="secondary"
              onPress={handleCancelSession}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passIndicator: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay,
  },
  passLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  passDots: {
    flexDirection: 'row',
    gap: 5,
  },
  passDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  passDotDone: {
    backgroundColor: colors.success,
  },
  passDotCurrent: {
    backgroundColor: colors.accent,
  },
  hints: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing.lg,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.overlayStrong,
  },
  panelHint: {
    ...type.callout,
    color: colors.text,
    textAlign: 'center',
  },
  spinner: {
    marginVertical: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryAction: {
    flex: 1,
  },
  primaryAction: {
    flex: 2,
  },
});
