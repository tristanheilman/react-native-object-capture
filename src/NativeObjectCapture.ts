// src/NativeObjectCapture.ts
import {
  NativeEventEmitter,
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

export type SessionError = {
  error: string;
  target: number;
};

export interface ObjectCaptureEvents {
  onSessionStateChange: (event: NativeSyntheticEvent<SessionState>) => void;
  onTrackingStateChange: (event: NativeSyntheticEvent<TrackingState>) => void;
  onFeedbackStateChange: (event: NativeSyntheticEvent<FeedbackState[]>) => void;
  onCaptureComplete: (event: NativeSyntheticEvent<boolean>) => void;
}

// Define the interface for the native module
interface RNObjectCaptureInterface extends NativeModule {
  constants: {
    SessionState: {
      initializing: string;
      ready: string;
      capturing: string;
      processing: string;
      completed: string;
      failed: string;
    };
  };
}

// Export the native module with proper typing
export const RNObjectCapture =
  NativeModules.RNObjectCapture as RNObjectCaptureInterface;

// Export the event emitter
export const objectCaptureEmitter = new NativeEventEmitter(RNObjectCapture);

export default RNObjectCapture;
