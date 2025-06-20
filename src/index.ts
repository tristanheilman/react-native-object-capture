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
} from './NativeObjectCapture';
import ObjectCaptureView from './components/RNObjectCaptureView';
import ObjectCapturePointCloudView from './components/RNObjectCapturePointCloudView';
import QuickLookView from './components/RNQuickLookView';
import PhotogrammetrySession, {
  type PhotogrammetryProgress,
  type PhotogrammetryError,
  type PhotogrammetryEvents,
  type PhotogrammetrySessionState,
  type PhotogrammetrySessionOptions,
  type PhotogrammetryDirectoryContents,
} from './modules/PhotogrammetrySession';

// Export the view component
export { ObjectCaptureView, ObjectCapturePointCloudView, QuickLookView };

// Export types
export type { ObjectCaptureViewProps } from './components/RNObjectCaptureView';
export type { ObjectCapturePointCloudViewProps } from './components/RNObjectCapturePointCloudView';
export type { QuickLookViewProps } from './components/RNQuickLookView';
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
  PhotogrammetryDirectoryContents,
};

// Export hooks and utilities
export { PhotogrammetrySession };

// Export constants
export const ObjectCaptureConstants = ObjectCapture.constants;
