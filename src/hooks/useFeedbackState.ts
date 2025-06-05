import { useEffect, useState } from 'react';
import {
  type FeedbackState,
  objectCaptureEmitter,
} from '../NativeObjectCapture';

const useFeedbackState = () => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState[]>([
    'objectNotDetected',
  ]);

  useEffect(() => {
    const feedbackSubscription = objectCaptureEmitter.addListener(
      'onFeedbackStateChange',
      (event: { feedback: FeedbackState[] }) => {
        setFeedbackState(event.feedback);
      }
    );

    return () => {
      feedbackSubscription.remove();
    };
  }, []);

  return feedbackState;
};

export default useFeedbackState;
