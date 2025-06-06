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
  type ScanPassCompleted,
  objectCaptureEmitter,
} from './NativeObjectCapture';
import ObjectCaptureView from './components/RNObjectCaptureView';
import ObjectCapturePointCloudView from './components/RNObjectCapturePointCloudView';
import PhotogrammetrySession, {
  type PhotogrammetryProgress,
  type PhotogrammetryError,
  type PhotogrammetryEvents,
  type PhotogrammetrySessionState,
  type PhotogrammetrySessionOptions,
} from './modules/PhotogrammetrySession';

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
  ScanPassCompleted,
  SessionError,
};
export type { ObjectCaptureViewRef } from './components/RNObjectCaptureView';
export type { ObjectCapturePointCloudViewRef } from './components/RNObjectCapturePointCloudView';

// Export Photogrammetry types
export type {
  PhotogrammetryProgress,
  PhotogrammetryError,
  PhotogrammetryEvents,
  PhotogrammetrySessionState,
  PhotogrammetrySessionOptions,
};

// Export hooks and utilities
export { objectCaptureEmitter, PhotogrammetrySession };

// Export constants
export const ObjectCaptureConstants = ObjectCapture.constants;
