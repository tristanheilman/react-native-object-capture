import ObjectCapture, {
  useObjectCapture,
  type SessionState,
  objectCaptureEmitter,
} from './NativeObjectCapture';
import ObjectCaptureView from './components/ObjectCaptureView';

// Export the view component
export { ObjectCaptureView };

// Export types
export type { ObjectCaptureViewProps } from './components/ObjectCaptureView';
export type { SessionState };

// Export hooks and utilities
export { useObjectCapture, objectCaptureEmitter };

// Export constants
export const ObjectCaptureConstants = ObjectCapture.constants;
