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
  | 'capturing'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ObjectCaptureEvents {
  onSessionStateChange: (state: SessionState) => void;
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
