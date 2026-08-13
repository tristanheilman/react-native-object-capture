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

// Export the native module with proper typing. Be aware that at runtime this
// object is inert on both of the things it appears to offer:
//
// - Constants: RNObjectCapture.swift exposes `getConstants()`, but RN sources
//   legacy-module constants from `constantsToExport` (RCTModuleData gates on
//   `instancesRespondToSelector:@selector(constantsToExport)`), which neither
//   the class nor RCTEventEmitter implements. `.constants` is undefined, and so
//   is the `ObjectCaptureConstants` re-export in index.ts.
// - Events: it is an RCTEventEmitter, and SessionView.handleAppear means to pass
//   this instance to RNObjectCaptureSessionManager so the manager can sendEvent
//   on session, tracking, feedback, capture and error changes. That lookup goes
//   through `RCTBridge.current()`, nil under bridgeless, so on the New
//   Architecture it never attaches and nothing is ever emitted.
//
// The types above are what this file actually provides. Session events reach
// consumers through the typed `on*` props on ObjectCaptureView, and the enum
// values through the exported string-union types - hence no NativeEventEmitter
// here. Restoring either path means fixing the native side first.
export const RNObjectCapture =
  NativeModules.RNObjectCapture as RNObjectCaptureInterface;

export default RNObjectCapture;
