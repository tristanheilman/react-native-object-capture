import { NativeModules } from 'react-native';
import PhotogrammetrySession, {
  photogrammetryEmitter,
} from '../modules/PhotogrammetrySession';

// Mock the native modules
jest.mock('react-native', () => ({
  NativeModules: {
    RNPhotogrammetrySession: {
      startReconstruction: jest.fn(),
      cancelReconstruction: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
}));

describe('PhotogrammetrySession', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('startReconstruction', () => {
    it('should call native module with correct parameters', async () => {
      const mockOptions = {
        inputPath: '/path/to/input',
        checkpointPath: '/path/to/checkpoints',
        outputPath: '/path/to/output.usdz',
      };

      // Mock successful response
      (
        NativeModules.RNPhotogrammetrySession.startReconstruction as jest.Mock
      ).mockResolvedValue(true);

      await PhotogrammetrySession.startReconstruction(mockOptions);

      expect(
        NativeModules.RNPhotogrammetrySession.startReconstruction
      ).toHaveBeenCalledWith({
        inputPath: mockOptions.inputPath,
        checkpointPath: mockOptions.checkpointPath,
        outputPath: mockOptions.outputPath,
      });
    });

    it('should handle native module errors', async () => {
      const mockOptions = {
        inputPath: '/path/to/input',
        checkpointPath: '/path/to/checkpoints',
        outputPath: '/path/to/output.usdz',
      };

      // Mock error response
      const mockError = new Error('Native module error');
      (
        NativeModules.RNPhotogrammetrySession.startReconstruction as jest.Mock
      ).mockRejectedValue(mockError);

      await expect(
        PhotogrammetrySession.startReconstruction(mockOptions)
      ).rejects.toThrow('Native module error');
    });
  });

  describe('event listeners', () => {
    it('should add and remove progress listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addProgressListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onProgress',
        expect.any(Function)
      );
    });

    it('should add and remove complete listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addCompleteListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onComplete',
        expect.any(Function)
      );
    });

    it('should add and remove error listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addErrorListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onError',
        expect.any(Function)
      );
    });

    it('should add and remove request complete listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addRequestCompleteListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onRequestComplete',
        expect.any(Function)
      );
    });

    it('should add and remove input complete listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addInputCompleteListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onInputComplete',
        expect.any(Function)
      );
    });

    it('should add and remove invalid sample listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addInvalidSampleListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onInvalidSample',
        expect.any(Function)
      );
    });

    it('should add and remove skipped sample listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addSkippedSampleListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onSkippedSample',
        expect.any(Function)
      );
    });

    it('should add and remove automatic downsampling listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addAutomaticDownsamplingListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onAutomaticDownsampling',
        expect.any(Function)
      );
    });

    it('should add and remove processing cancelled listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addProcessingCancelledListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onProcessingCancelled',
        expect.any(Function)
      );
    });

    it('should add and remove unknown output listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');

      PhotogrammetrySession.addUnknownOutputListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onUnknownOutput',
        expect.any(Function)
      );
    });

    it('should remove all listeners', () => {
      const mockProgressCallback = jest.fn();
      const mockCompleteCallback = jest.fn();
      const mockErrorCallback = jest.fn();
      const mockCancelledCallback = jest.fn();

      // Add all listeners
      PhotogrammetrySession.addProgressListener(mockProgressCallback);
      PhotogrammetrySession.addCompleteListener(mockCompleteCallback);
      PhotogrammetrySession.addErrorListener(mockErrorCallback);
      PhotogrammetrySession.addCancelledListener(mockCancelledCallback);

      // Remove all listeners
      PhotogrammetrySession.removeAllListeners();

      // Verify that all listeners were removed
      expect(mockProgressCallback).not.toHaveBeenCalled();
      expect(mockCompleteCallback).not.toHaveBeenCalled();
      expect(mockErrorCallback).not.toHaveBeenCalled();
      expect(mockCancelledCallback).not.toHaveBeenCalled();
    });
  });

  describe('cancelReconstruction', () => {
    it('should call native module cancel method', async () => {
      // Mock successful response
      (
        NativeModules.RNPhotogrammetrySession.cancelReconstruction as jest.Mock
      ).mockResolvedValue(true);

      await PhotogrammetrySession.cancelReconstruction();

      expect(
        NativeModules.RNPhotogrammetrySession.cancelReconstruction
      ).toHaveBeenCalled();
    });

    it('should handle native module errors during cancellation', async () => {
      // Mock error response
      const mockError = new Error('Cancellation failed');
      (
        NativeModules.RNPhotogrammetrySession.cancelReconstruction as jest.Mock
      ).mockRejectedValue(mockError);

      await expect(
        PhotogrammetrySession.cancelReconstruction()
      ).rejects.toThrow('Cancellation failed');
    });
  });
});
