// src/NativeObjectCapture.ts
import {
  NativeModules,
  type NativeModule,
  type NativeSyntheticEvent,
} from 'react-native';

export type SessionState =
  | 'initializing'
  | 'ready'
  | 'detecting'
  | 'capturing'
  | 'processing'
  | 'completed'
  | 'failed';

export type TrackingState = 'notAvailable' | 'limited' | 'normal';

export type FeedbackState =
  | 'objectTooClose'
  | 'objectTooFar'
  | 'movingTooFast'
  | 'environmentLowLight'
  | 'environmentTooDark'
  | 'outOfFieldOfView'
  | 'objectNotFlippable'
  | 'overCapturing'
  | 'objectNotDetected';

export type SessionStateChange = {
  state: SessionState;
  target: number;
};

export type TrackingStateChange = {
  tracking: TrackingState;
  target: number;
};

export type FeedbackStateChange = {
  feedback: FeedbackState[];
  target: number;
};

export type CaptureComplete = {
  completed: boolean;
  target: number;
};

export type ScanPassCompleted = {
  completed: boolean;
  target: number;
};

export type SessionError = {
  error: string;
  target: number;
};

export type OnAppearEvent = {
  scanPassCompleted: boolean;
};

export type OnCloudPointViewAppearEvent = {
  scanPassCompleted: boolean;
};

export interface ObjectCaptureEvents {
  onSessionStateChange: (event: NativeSyntheticEvent<SessionState>) => void;
  onTrackingStateChange: (event: NativeSyntheticEvent<TrackingState>) => void;
  onFeedbackStateChange: (event: NativeSyntheticEvent<FeedbackState[]>) => void;
  onCaptureComplete: (event: NativeSyntheticEvent<CaptureComplete>) => void;
  onScanPassCompleted: (event: NativeSyntheticEvent<ScanPassCompleted>) => void;
}

// Define the interface for the native module
interface RNObjectCaptureInterface extends NativeModule {
  constants: {
    SessionState: SessionState;
    FeedbackState: [FeedbackState];
    TrackingState: TrackingState;
  };
}

// Export the native module with proper typing. This module exists only to carry
// the enum constants - session events reach JS through the view's own event
// emitter (the `on*` props on ObjectCaptureView), not through a module emitter.
export const RNObjectCapture =
  NativeModules.RNObjectCapture as RNObjectCaptureInterface;

export default RNObjectCapture;
