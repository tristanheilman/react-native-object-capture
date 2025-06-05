import { useEffect, useState } from 'react';
import {
  type TrackingState,
  objectCaptureEmitter,
} from '../NativeObjectCapture';

const useTrackingState = () => {
  const [trackingState, setTrackingState] =
    useState<TrackingState>('notAvailable');

  useEffect(() => {
    const trackingSubscription = objectCaptureEmitter.addListener(
      'onTrackingStateChange',
      (event: { tracking: TrackingState }) => {
        setTrackingState(event.tracking);
      }
    );

    return () => {
      trackingSubscription.remove();
    };
  }, []);

  return trackingState;
};

export default useTrackingState;
