import { useEffect, useState } from 'react';
import {
  type SessionState,
  objectCaptureEmitter,
} from '../NativeObjectCapture';

const useSessionState = () => {
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

  return sessionState;
};

export default useSessionState;
