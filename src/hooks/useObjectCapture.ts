import { useEffect, useState } from 'react';
import RNObjectCapture, {
  type SessionState,
  type TrackingState,
  type FeedbackState,
  objectCaptureEmitter,
} from '../NativeObjectCapture';

const useObjectCapture = () => {
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

export default useObjectCapture;
