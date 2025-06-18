import { NativeModules } from 'react-native';
import PhotogrammetrySession, {
  photogrammetryEmitter,
} from '../modules/PhotogrammetrySession';

describe('RNPhotogrammetrySession', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('startReconstruction', () => {
    it('should call native module with correct parameters', async () => {
      const mockOptions = {
        imagesDirectory: '/path/to/input',
        checkpointDirectory: '/path/to/checkpoints',
        outputPath: 'Outputs/model.usdz',
      };

      // Mock successful response
      (
        NativeModules.RNPhotogrammetrySession.startReconstruction as jest.Mock
      ).mockResolvedValue(true);

      await PhotogrammetrySession.startReconstruction(mockOptions);

      expect(
        NativeModules.RNPhotogrammetrySession.startReconstruction
      ).toHaveBeenCalledWith(
        mockOptions.imagesDirectory,
        mockOptions.checkpointDirectory,
        mockOptions.outputPath
      );
    });

    it('should handle native module errors', async () => {
      const mockOptions = {
        imagesDirectory: '/path/to/input',
        checkpointDirectory: '/path/to/checkpoints',
        outputPath: 'Outputs/model.usdz',
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
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );

      PhotogrammetrySession.addProgressListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onProgress',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the progress event is emitted', () => {
      const mockCallback = jest.fn();

      PhotogrammetrySession.addProgressListener(mockCallback);
      photogrammetryEmitter.emit('onProgress', { progress: 0.5 });

      expect(mockCallback).toHaveBeenCalledWith(0.5);
    });

    it('should add and remove complete listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );

      PhotogrammetrySession.addCompleteListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onComplete',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the complete event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addCompleteListener(mockCallback);
      photogrammetryEmitter.emit('onComplete');

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should add and remove error listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );

      PhotogrammetrySession.addErrorListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onError',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the error event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addErrorListener(mockCallback);
      photogrammetryEmitter.emit('onError', { error: 'error' });

      expect(mockCallback).toHaveBeenCalledWith('error');
    });

    it('should add and remove request complete listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );

      PhotogrammetrySession.addRequestCompleteListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onRequestComplete',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the request complete event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addRequestCompleteListener(mockCallback);
      photogrammetryEmitter.emit('onRequestComplete');

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should add and remove input complete listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );

      PhotogrammetrySession.addInputCompleteListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onInputComplete',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the input complete event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addInputCompleteListener(mockCallback);
      photogrammetryEmitter.emit('onInputComplete');

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should add and remove invalid sample listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );

      PhotogrammetrySession.addInvalidSampleListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onInvalidSample',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the invalid sample event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addInvalidSampleListener(mockCallback);
      photogrammetryEmitter.emit('onInvalidSample', {
        id: '1',
        reason: 'reason',
      });
    });

    it('should add and remove skipped sample listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );

      PhotogrammetrySession.addSkippedSampleListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onSkippedSample',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the skipped sample event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addSkippedSampleListener(mockCallback);
      photogrammetryEmitter.emit('onSkippedSample', { id: '1' });

      expect(mockCallback).toHaveBeenCalledWith({ id: '1' });
    });

    it('should add and remove automatic downsampling listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );
      PhotogrammetrySession.addAutomaticDownsamplingListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onAutomaticDownsampling',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the automatic downsampling event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addAutomaticDownsamplingListener(mockCallback);
      photogrammetryEmitter.emit('onAutomaticDownsampling');

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should add and remove processing cancelled listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );
      PhotogrammetrySession.addProcessingCancelledListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onProcessingCancelled',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the processing cancelled event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addProcessingCancelledListener(mockCallback);
      photogrammetryEmitter.emit('onProcessingCancelled');

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should add and remove unknown output listener', () => {
      const mockCallback = jest.fn();
      const addListenerSpy = jest.spyOn(photogrammetryEmitter, 'addListener');
      const removeListenerSpy = jest.spyOn(
        PhotogrammetrySession,
        'removeAllListeners'
      );
      PhotogrammetrySession.addUnknownOutputListener(mockCallback);

      expect(addListenerSpy).toHaveBeenCalledWith(
        'onUnknownOutput',
        expect.any(Function)
      );

      PhotogrammetrySession.removeAllListeners();

      expect(mockCallback).not.toHaveBeenCalled();
      expect(addListenerSpy).toHaveBeenCalledTimes(1);
      expect(removeListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback when the unknown output event is emitted', () => {
      const mockCallback = jest.fn();
      PhotogrammetrySession.addUnknownOutputListener(mockCallback);
      photogrammetryEmitter.emit('onUnknownOutput');

      expect(mockCallback).toHaveBeenCalled();
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

  describe('listDirectoryContents', () => {
    it('should call native module listDirectoryContents method', async () => {
      // Mock successful response
      (
        NativeModules.RNPhotogrammetrySession.listDirectoryContents as jest.Mock
      ).mockResolvedValue({
        path: '/path/to/directory',
        exists: true,
        files: [],
      });

      await PhotogrammetrySession.listDirectoryContents('/path/to/directory');

      expect(
        NativeModules.RNPhotogrammetrySession.listDirectoryContents
      ).toHaveBeenCalledWith('/path/to/directory');
    });

    it('should return the correct directory contents', async () => {
      (
        NativeModules.RNPhotogrammetrySession.listDirectoryContents as jest.Mock
      ).mockResolvedValue({
        path: '/path/to/directory',
        exists: true,
        files: [
          {
            name: 'file1',
            path: '/path/to/directory/file1',
            size: 100,
            creationDate: 1718534400,
            isDirectory: false,
          },
        ],
      });
      const result =
        await PhotogrammetrySession.listDirectoryContents('/path/to/directory');
      expect(result).toEqual({
        path: '/path/to/directory',
        exists: true,
        files: [
          {
            name: 'file1',
            path: '/path/to/directory/file1',
            size: 100,
            creationDate: 1718534400,
            isDirectory: false,
          },
        ],
      });
    });

    it('should handle native module errors', async () => {
      const mockError = new Error('Native module error');
      (
        NativeModules.RNPhotogrammetrySession.listDirectoryContents as jest.Mock
      ).mockRejectedValue(mockError);

      await expect(
        PhotogrammetrySession.listDirectoryContents('/path/to/directory')
      ).rejects.toThrow('Native module error');
    });
  });
});
