import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Imperative control over the Object Capture session.
 *
 * These methods previously lived on the view manager and each took a react tag,
 * but the tag was never used - every call operated on a shared singleton
 * session. Modelling them as a turbo module drops `findNodeHandle` (which has
 * no place under the New Architecture) and lets the methods return promises,
 * which view commands cannot do.
 *
 * Registered via `TurboModuleRegistry.get` rather than `getEnforcing` because
 * this module is iOS-only; on other platforms the lookup returns null instead
 * of throwing at import time.
 */
export interface Spec extends TurboModule {
  resumeSession(): Promise<void>;
  pauseSession(): Promise<void>;
  startDetection(): Promise<void>;
  resetDetection(): Promise<void>;
  startCapturing(): Promise<void>;
  beginNewScanAfterFlip(): Promise<void>;
  beginNewScan(): Promise<void>;
  finishSession(): Promise<void>;
  cancelSession(): Promise<void>;

  isDeviceSupported(): Promise<boolean>;
  getSessionState(): Promise<string>;
  getTrackingState(): Promise<string>;
  getFeedbackState(): Promise<string[]>;
  getNumberOfShotsTaken(): Promise<number>;
  getUserCompletedScanState(): Promise<boolean>;
  getNumberOfScanPassUpdates(): Promise<number>;
}

export default TurboModuleRegistry.get<Spec>('RNObjectCaptureSession');
