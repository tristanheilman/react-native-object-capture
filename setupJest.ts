// setupJest.ts

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native'); // use original implementation, which comes with mocks out of the box

  // mock modules/components created by assigning to NativeModules
  RN.NativeModules.RNObjectCaptureView = {
    resumeSession: jest.fn(),
    pauseSession: jest.fn(),
    startDetection: jest.fn(),
    resetDetection: jest.fn(),
    startCapturing: jest.fn(),
    beginNewScanAfterFlip: jest.fn(),
    beginNewScan: jest.fn(),
    finishSession: jest.fn(),
    cancelSession: jest.fn(),
    getTrackingState: jest.fn(),
    getFeedbackState: jest.fn(),
    getNumberOfShotsTaken: jest.fn(),
    getUserCompletedScanState: jest.fn(),
    isDeviceSupported: jest.fn(),
    getSessionState: jest.fn(),
  };

  RN.NativeModules.RNPhotogrammetrySession = {
    startReconstruction: jest.fn(),
    cancelReconstruction: jest.fn(),
    addErrorListener: jest.fn(),
    addRequestCompleteListener: jest.fn(),
    addInputCompleteListener: jest.fn(),
    addInvalidSampleListener: jest.fn(),
    addSkippedSampleListener: jest.fn(),
    addAutomaticDownsamplingListener: jest.fn(),
    addProcessingCancelledListener: jest.fn(),
    addUnknownOutputListener: jest.fn(),
    addListener: jest.fn(),
  };

  RN.NativeModules.RNObjectCapture = {
    constants: {
      SessionState: {
        initializing: 'initializing',
        ready: 'ready',
        capturing: 'capturing',
        processing: 'processing',
        completed: 'completed',
        failed: 'failed',
      },
    },
  };

  // mock modules created through UIManager
  RN.NativeEventEmitter.addListener = jest
    .fn()
    .mockReturnValue({ remove: jest.fn() });
  RN.NativeEventEmitter.removeAllListeners = jest.fn();

  return RN;
});
