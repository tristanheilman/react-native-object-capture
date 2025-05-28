// src/index.tsx
import ObjectCapture, {
  type SessionState,
  type TrackingState,
  type FeedbackState,
  type SessionStateChange,
  type TrackingStateChange,
  type FeedbackStateChange,
  type CaptureComplete,
  type SessionError,
  objectCaptureEmitter,
} from './NativeObjectCapture';
import ObjectCaptureView from './components/RNObjectCaptureView';
import ObjectCapturePointCloudView from './components/RNObjectCapturePointCloudView';

// Export the view component
export { ObjectCaptureView, ObjectCapturePointCloudView };

// Export types
export type { ObjectCaptureViewProps } from './components/RNObjectCaptureView';
export type { ObjectCapturePointCloudViewProps } from './components/RNObjectCapturePointCloudView';
export type {
  SessionState,
  TrackingState,
  FeedbackState,
  SessionStateChange,
  TrackingStateChange,
  FeedbackStateChange,
  CaptureComplete,
  SessionError,
};
export type { ObjectCaptureViewRef } from './components/RNObjectCaptureView';
export type { ObjectCapturePointCloudViewRef } from './components/RNObjectCapturePointCloudView';

// Export hooks and utilities
export { objectCaptureEmitter };

// Export constants
export const ObjectCaptureConstants = ObjectCapture.constants;
