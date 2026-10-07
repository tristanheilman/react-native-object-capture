import type {
  FeedbackState,
  SessionState,
  TrackingState,
} from 'react-native-object-capture';

// RealityKit reports these as enum names; show the user what to do instead.
export const feedbackLabels: Record<FeedbackState, string> = {
  objectTooClose: 'Move farther away',
  objectTooFar: 'Move closer',
  movingTooFast: 'Slow down',
  environmentLowLight: 'More light needed',
  environmentTooDark: 'Too dark to capture',
  outOfFieldOfView: 'Keep the object in frame',
  objectNotFlippable: 'This object may not flip well',
  overCapturing: 'Enough photos from this angle',
  objectNotDetected: 'No object detected',
};

export const trackingLabels: Record<TrackingState, string> = {
  notAvailable: 'Tracking unavailable',
  limited: 'Tracking limited',
  normal: 'Tracking',
};

export function stateHint(state: SessionState): string {
  switch (state) {
    case 'initializing':
      return 'Preparing the camera…';
    case 'ready':
      return 'Point at your object, then start detection.';
    case 'detecting':
      return 'Adjust the box to fit the object, then start capturing.';
    case 'capturing':
      return 'Move slowly around the object.';
    case 'processing':
      return 'Finishing capture…';
    case 'completed':
      return 'Capture complete.';
    case 'failed':
      return 'The capture session failed. Close and try again.';
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(secondsSinceEpoch: number): string {
  if (!secondsSinceEpoch) return '';
  return new Date(secondsSinceEpoch * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
