import { useImperativeHandle, forwardRef } from 'react';
import {
  Platform,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import {
  type SessionState,
  type TrackingState,
  type FeedbackState,
  type FeedbackStateChange,
  type TrackingStateChange,
  type SessionStateChange,
  type CaptureComplete,
  type SessionError,
  type ScanPassCompleted,
} from '../NativeObjectCapture';
import RNObjectCaptureView from '../specs/RNObjectCaptureViewNativeComponent';
import ObjectCaptureSession from '../modules/ObjectCaptureSession';

/**
 * The public event payload types carry `target`, which React Native injects
 * into every direct event at runtime but which codegen does not model in the
 * spec. The runtime shape is identical, so this only reconciles the two static
 * views of the same object.
 */
const asNativeHandler = <Public, Native>(
  handler: ((event: NativeSyntheticEvent<Public>) => void) | undefined
): ((event: NativeSyntheticEvent<Native>) => void) | undefined =>
  handler as unknown as
    | ((event: NativeSyntheticEvent<Native>) => void)
    | undefined;

export interface ObjectCaptureViewProps {
  style?: ViewStyle;
  testID?: string;
  checkpointDirectory: string;
  imagesDirectory: string;
  onSessionStateChange?: (
    event: NativeSyntheticEvent<SessionStateChange>
  ) => void;
  onTrackingStateChange?: (
    event: NativeSyntheticEvent<TrackingStateChange>
  ) => void;
  onFeedbackStateChange?: (
    event: NativeSyntheticEvent<FeedbackStateChange>
  ) => void;
  onCaptureComplete?: (event: NativeSyntheticEvent<CaptureComplete>) => void;
  onScanPassCompleted?: (
    event: NativeSyntheticEvent<ScanPassCompleted>
  ) => void;
  onError?: (event: NativeSyntheticEvent<SessionError>) => void;
}

export interface ObjectCaptureViewRef {
  resumeSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  startDetection: () => Promise<void>;
  resetDetection: () => Promise<void>;
  startCapturing: () => Promise<void>;
  beginNewScanAfterFlip: () => Promise<void>;
  beginNewScan: () => Promise<void>;
  finishSession: () => Promise<void>;
  cancelSession: () => Promise<void>;
  getTrackingState: () => Promise<TrackingState>;
  getFeedbackState: () => Promise<FeedbackState[]>;
  getNumberOfShotsTaken: () => Promise<number>;
  getUserCompletedScanState: () => Promise<boolean>;
  isDeviceSupported: () => Promise<boolean>;
  getSessionState: () => Promise<SessionState>;
  getNumberOfScanPassUpdates: () => Promise<number>;
}

/**
 * The ref API is kept for backwards compatibility, but it now delegates
 * straight to the `ObjectCaptureSession` module. The session is a singleton
 * natively, so these calls were never scoped to a view instance - the react tag
 * they used to pass was ignored. Prefer importing `ObjectCaptureSession`
 * directly; this ref will likely be deprecated.
 */
const ObjectCaptureView = forwardRef<
  ObjectCaptureViewRef,
  ObjectCaptureViewProps
>(
  (
    {
      style,
      testID = 'RNObjectCaptureView',
      checkpointDirectory,
      imagesDirectory,
      onSessionStateChange,
      onTrackingStateChange,
      onFeedbackStateChange,
      onCaptureComplete,
      onScanPassCompleted,
      onError,
    },
    ref
  ) => {
    useImperativeHandle(ref, () => ObjectCaptureSession, []);

    if (Platform.OS !== 'ios') {
      console.warn('RNObjectCaptureView is only available on iOS');
      return null;
    }

    return (
      <RNObjectCaptureView
        style={style}
        testID={testID}
        checkpointDirectory={checkpointDirectory}
        imagesDirectory={imagesDirectory}
        onCaptureComplete={asNativeHandler(onCaptureComplete)}
        onFeedbackStateChange={asNativeHandler(onFeedbackStateChange)}
        onTrackingStateChange={asNativeHandler(onTrackingStateChange)}
        onSessionStateChange={asNativeHandler(onSessionStateChange)}
        onScanPassCompleted={asNativeHandler(onScanPassCompleted)}
        onError={asNativeHandler(onError)}
      />
    );
  }
);

export default ObjectCaptureView;
