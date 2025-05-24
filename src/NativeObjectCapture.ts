import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

export type SessionState =
  | 'initializing'
  | 'ready'
  | 'capturing'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ObjectCaptureEvents {
  onSessionStateChange: (state: SessionState) => void;
}

// Export the native module
export const RNObjectCapture = NativeModules.RNObjectCapture;

// Export the event emitter
export const objectCaptureEmitter = new NativeEventEmitter(RNObjectCapture);

export const useObjectCapture = () => {
  const [sessionState, setSessionState] =
    useState<SessionState>('initializing');

  useEffect(() => {
    const subscription = objectCaptureEmitter.addListener(
      'onSessionStateChange',
      (event: { state: SessionState }) => {
        setSessionState(event.state);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    sessionState,
    constants: RNObjectCapture.constants,
  };
};

export default RNObjectCapture;
