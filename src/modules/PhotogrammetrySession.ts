import {
  NativeEventEmitter,
  NativeModules,
  type NativeModule,
  type NativeSyntheticEvent,
} from 'react-native';

export type PhotogrammetryProgress = {
  progress: number;
};

export type PhotogrammetryError = {
  error: string;
};

export type PhotogrammetryInvalidSample = {
  id: string;
  reason: string;
};

export type PhotogrammetrySkippedSample = {
  id: string;
};

export type PhotogrammetrySessionState = {
  state: string;
  progress: number;
  result: string | null;
};

export interface PhotogrammetryEvents {
  onProgress: (event: PhotogrammetryProgress) => void;
  onComplete: () => void;
  onError: (event: PhotogrammetryError) => void;
  onCancelled: () => void;
  onRequestComplete: () => void;
  onInputComplete: () => void;
  onInvalidSample: (
    event: NativeSyntheticEvent<PhotogrammetryInvalidSample>
  ) => void;
  onSkippedSample: (
    event: NativeSyntheticEvent<PhotogrammetrySkippedSample>
  ) => void;
  onAutomaticDownsampling: () => void;
  onProcessingCancelled: () => void;
  onUnknownOutput: () => void;
}

export type PhotogrammetrySessionOptions = {
  inputPath: string;
  checkpointPath: string;
  outputPath: string;
};

// Define the interface for the native module
interface RNPhotogrammetrySessionInterface extends NativeModule {
  startReconstruction(
    inputPath: string,
    checkpointPath: string,
    outputPath: string
  ): Promise<boolean>;
  cancelReconstruction(): Promise<boolean>;
}

// Export the native module with proper typing
export const RNPhotogrammetrySession =
  NativeModules.RNPhotogrammetrySession as RNPhotogrammetrySessionInterface;

// Export the event emitter
export const photogrammetryEmitter = new NativeEventEmitter(
  RNPhotogrammetrySession
);

class PhotogrammetrySession {
  private eventEmitter: NativeEventEmitter;
  private listeners: { [key: string]: any } = {};

  constructor() {
    this.eventEmitter = photogrammetryEmitter;
  }

  async startReconstruction({
    inputPath,
    checkpointPath,
    outputPath,
  }: PhotogrammetrySessionOptions) {
    return RNPhotogrammetrySession.startReconstruction(
      inputPath,
      checkpointPath,
      outputPath
    );
  }

  async cancelReconstruction() {
    return RNPhotogrammetrySession.cancelReconstruction();
  }

  addProgressListener(callback: (progress: number) => void) {
    this.listeners.progress = this.eventEmitter.addListener(
      'onProgress',
      (event: PhotogrammetryProgress) => {
        console.log('event', event);
        callback(event.progress);
      }
    );
  }

  addCompleteListener(callback: () => void) {
    this.listeners.complete = this.eventEmitter.addListener(
      'onComplete',
      callback
    );
  }

  addErrorListener(callback: (error: string) => void) {
    this.listeners.error = this.eventEmitter.addListener(
      'onError',
      (event: PhotogrammetryError) => {
        console.log('error event', event);
        callback(event.error);
      }
    );
  }

  addCancelledListener(callback: () => void) {
    this.listeners.cancelled = this.eventEmitter.addListener(
      'onCancelled',
      callback
    );
  }

  addRequestCompleteListener(callback: () => void) {
    this.listeners.requestComplete = this.eventEmitter.addListener(
      'onRequestComplete',
      callback
    );
  }

  addInputCompleteListener(callback: () => void) {
    this.listeners.inputComplete = this.eventEmitter.addListener(
      'onInputComplete',
      callback
    );
  }

  addInvalidSampleListener(
    callback: (event: PhotogrammetryInvalidSample) => void
  ) {
    this.listeners.invalidSample = this.eventEmitter.addListener(
      'onInvalidSample',
      (event: PhotogrammetryInvalidSample) => {
        console.log('error event', event);
        callback(event);
      }
    );
  }

  addSkippedSampleListener(
    callback: (event: PhotogrammetrySkippedSample) => void
  ) {
    this.listeners.skippedSample = this.eventEmitter.addListener(
      'onSkippedSample',
      (event: PhotogrammetrySkippedSample) => {
        console.log('error event', event);
        callback(event);
      }
    );
  }

  addAutomaticDownsamplingListener(callback: () => void) {
    this.listeners.automaticDownsampling = this.eventEmitter.addListener(
      'onAutomaticDownsampling',
      callback
    );
  }

  addProcessingCancelledListener(callback: () => void) {
    this.listeners.processingCancelled = this.eventEmitter.addListener(
      'onProcessingCancelled',
      callback
    );
  }

  addUnknownOutputListener(callback: () => void) {
    this.listeners.unknownOutput = this.eventEmitter.addListener(
      'onUnknownOutput',
      callback
    );
  }

  removeAllListeners() {
    Object.values(this.listeners).forEach((listener) => listener.remove());
    this.listeners = {};
  }
}

export default new PhotogrammetrySession();
