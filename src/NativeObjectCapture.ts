// src/NativeObjectCapture.ts
import { useEffect, useState } from 'react';
import {
  NativeEventEmitter,
  NativeModules,
  type NativeModule,
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

export interface ObjectCaptureEvents {
  onSessionStateChange: (state: SessionState) => void;
  onTrackingStateChange: (state: TrackingState) => void;
  onFeedbackStateChange: (state: FeedbackState) => void;
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

export const useObjectCapture = () => {
  const [sessionState, setSessionState] =
    useState<SessionState>('initializing');
  const [trackingState, setTrackingState] =
    useState<TrackingState>('notAvailable');
  const [feedbackState, setFeedbackState] = useState<FeedbackState[]>([
    'objectNotDetected',
  ]);

  useEffect(() => {
    const subscription = objectCaptureEmitter.addListener(
      'onSessionStateChange',
      (event: { state: SessionState }) => {
        setSessionState(event.state);
      }
    );

    const trackingSubscription = objectCaptureEmitter.addListener(
      'onTrackingStateChange',
      (event: { tracking: TrackingState }) => {
        setTrackingState(event.tracking);
      }
    );

    const feedbackSubscription = objectCaptureEmitter.addListener(
      'onFeedbackStateChange',
      (event: { feedback: FeedbackState[] }) => {
        setFeedbackState(event.feedback);
      }
    );

    return () => {
      subscription.remove();
      trackingSubscription.remove();
      feedbackSubscription.remove();
    };
  }, []);

  return {
    sessionState,
    trackingState,
    feedbackState,
    constants: RNObjectCapture.constants,
  };
};

export default RNObjectCapture;
