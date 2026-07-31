import NativeObjectCaptureSession from '../specs/NativeObjectCaptureSession';
import type {
  SessionState,
  TrackingState,
  FeedbackState,
} from '../NativeObjectCapture';

/**
 * Imperative control over the shared Object Capture session.
 *
 * The native session is a singleton, so these are module-level calls rather
 * than methods on a view ref. Every method rejects on a platform where the
 * native module is unavailable (i.e. anything other than iOS) instead of
 * failing with an opaque "undefined is not a function".
 */

function requireModule(): NonNullable<typeof NativeObjectCaptureSession> {
  if (!NativeObjectCaptureSession) {
    throw new Error(
      'RNObjectCaptureSession native module is not available. Object Capture ' +
        'requires iOS 17 or later on a device with LiDAR.'
    );
  }
  return NativeObjectCaptureSession;
}

// Every method is async so an unavailable native module surfaces as a rejected
// promise rather than a synchronous throw - callers are already using await.
const ObjectCaptureSession = {
  async resumeSession(): Promise<void> {
    return requireModule().resumeSession();
  },
  async pauseSession(): Promise<void> {
    return requireModule().pauseSession();
  },
  async startDetection(): Promise<void> {
    return requireModule().startDetection();
  },
  async resetDetection(): Promise<void> {
    return requireModule().resetDetection();
  },
  async startCapturing(): Promise<void> {
    return requireModule().startCapturing();
  },
  async beginNewScanAfterFlip(): Promise<void> {
    return requireModule().beginNewScanAfterFlip();
  },
  async beginNewScan(): Promise<void> {
    return requireModule().beginNewScan();
  },
  async finishSession(): Promise<void> {
    return requireModule().finishSession();
  },
  async cancelSession(): Promise<void> {
    return requireModule().cancelSession();
  },

  async isDeviceSupported(): Promise<boolean> {
    return requireModule().isDeviceSupported();
  },
  async getSessionState(): Promise<SessionState> {
    return (await requireModule().getSessionState()) as SessionState;
  },
  async getTrackingState(): Promise<TrackingState> {
    return (await requireModule().getTrackingState()) as TrackingState;
  },
  async getFeedbackState(): Promise<FeedbackState[]> {
    return (await requireModule().getFeedbackState()) as FeedbackState[];
  },
  async getNumberOfShotsTaken(): Promise<number> {
    return requireModule().getNumberOfShotsTaken();
  },
  async getUserCompletedScanState(): Promise<boolean> {
    return requireModule().getUserCompletedScanState();
  },
  async getNumberOfScanPassUpdates(): Promise<number> {
    return requireModule().getNumberOfScanPassUpdates();
  },
};

export default ObjectCaptureSession;
