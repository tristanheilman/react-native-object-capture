import type { HostComponent, ViewProps } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

/**
 * Codegen spec for the native ObjectCapture view.
 *
 * Types here are the *wire format* and are deliberately loose - codegen only
 * understands primitives, arrays and object literals, so state values are
 * plain `string` rather than the string unions used by the public API. The
 * public wrapper in `../components/RNObjectCaptureView` re-applies the narrow
 * types.
 *
 * Only props and events live here. The imperative session methods are on the
 * `RNObjectCaptureSession` turbo module instead - they operate on a shared
 * singleton session, not on a specific view instance.
 */

export type SessionStateChangeEvent = {
  state: string;
};

export type TrackingStateChangeEvent = {
  tracking: string;
};

export type FeedbackStateChangeEvent = {
  feedback: string[];
};

export type CaptureCompleteEvent = {
  completed: boolean;
};

export type ScanPassCompletedEvent = {
  completed: boolean;
};

export type SessionErrorEvent = {
  error: string;
};

export interface NativeProps extends ViewProps {
  checkpointDirectory?: string;
  imagesDirectory?: string;
  onSessionStateChange?: DirectEventHandler<SessionStateChangeEvent>;
  onTrackingStateChange?: DirectEventHandler<TrackingStateChangeEvent>;
  onFeedbackStateChange?: DirectEventHandler<FeedbackStateChangeEvent>;
  onCaptureComplete?: DirectEventHandler<CaptureCompleteEvent>;
  onScanPassCompleted?: DirectEventHandler<ScanPassCompletedEvent>;
  onError?: DirectEventHandler<SessionErrorEvent>;
}

export default codegenNativeComponent<NativeProps>(
  'RNObjectCaptureView'
) as HostComponent<NativeProps>;
