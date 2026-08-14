import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  type NativeModule,
  type NativeSyntheticEvent,
} from 'react-native';
import NativePhotogrammetrySession from '../specs/NativePhotogrammetrySession';

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

export type PhotogrammetryDirectoryContents = {
  path: string;
  exists: boolean;
  files: {
    name: string;
    path: string;
    size: number;
    creationDate: number;
    isDirectory: boolean;
  }[];
};

export type PhotogrammetrySessionState = {
  state: string;
  progress: number;
  result: string | null;
};

export interface PhotogrammetryEvents {
  onProgress: (event: PhotogrammetryProgress) => void;
  onComplete: () => void;
  onDimensions: (event: PhotogrammetryDimensions) => void;
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

/**
 * Reconstruction quality. On iOS, only `'reduced'` is supported by
 * `PhotogrammetrySession.Request.Detail` — the other levels exist on macOS only.
 * Passing an unsupported level rejects the promise with DETAIL_ERROR.
 */
export type PhotogrammetryDetail = 'reduced';

/** Real-world size of the captured object, in metres. */
export type PhotogrammetryDimensions = {
  width: number;
  height: number;
  depth: number;
  center: {
    x: number;
    y: number;
    z: number;
  };
};

export type PhotogrammetrySessionOptions = {
  imagesDirectory: string;
  checkpointDirectory: string;
  outputPath: string;
  /** Defaults to the framework's own default when omitted. */
  detail?: PhotogrammetryDetail;
};

// Define the interface for the native module
interface RNPhotogrammetrySessionInterface extends NativeModule {
  startReconstruction(
    imagesDirectory: string,
    checkpointDirectory: string,
    outputPath: string,
    detail: string
  ): Promise<boolean>;
  cancelReconstruction(): Promise<boolean>;
  listDirectoryContents(
    directory: string
  ): Promise<PhotogrammetryDirectoryContents>;
}

// Resolved through TurboModuleRegistry, which falls back to NativeModules when
// the New Architecture is not enabled, so this works under both.
export const RNPhotogrammetrySession = (NativePhotogrammetrySession ??
  NativeModules.RNPhotogrammetrySession) as
  | RNPhotogrammetrySessionInterface
  | undefined;

function requireModule(): RNPhotogrammetrySessionInterface {
  if (!RNPhotogrammetrySession) {
    throw new Error(
      'RNPhotogrammetrySession native module is not available. ' +
        'Photogrammetry requires iOS 17 or later.'
    );
  }
  return RNPhotogrammetrySession;
}

// Only iOS backs this emitter. The Android module implements the three
// reconstruction methods (each rejecting with NOT_IMPLEMENTED) but not the
// `addListener`/`removeListeners` bookkeeping NativeEventEmitter expects, so
// passing it there earns two console warnings on every import in exchange for
// listeners that can never fire. Passing undefined instead is the same dead
// emitter without the noise - and on iOS the module is an RCTEventEmitter, so
// the invariant that only fires there is satisfied.
export const photogrammetryEmitter = new NativeEventEmitter(
  Platform.OS === 'ios' ? RNPhotogrammetrySession : undefined
);

class PhotogrammetrySession {
  private eventEmitter: NativeEventEmitter;
  private listeners: { [key: string]: any } = {};

  constructor() {
    this.eventEmitter = photogrammetryEmitter;
  }

  async startReconstruction({
    imagesDirectory,
    checkpointDirectory,
    outputPath,
    detail,
  }: PhotogrammetrySessionOptions) {
    return requireModule().startReconstruction(
      imagesDirectory,
      checkpointDirectory,
      outputPath,
      detail ?? ''
    );
  }

  async cancelReconstruction() {
    return requireModule().cancelReconstruction();
  }

  async listDirectoryContents(directory: string) {
    return requireModule().listDirectoryContents(directory);
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

  /**
   * Fires once per reconstruction with the object's real-world size in metres.
   * Emitted when the bounds request completes, which is typically before
   * `onComplete`.
   */
  addDimensionsListener(callback: (event: PhotogrammetryDimensions) => void) {
    this.listeners.dimensions = this.eventEmitter.addListener(
      'onDimensions',
      (event: PhotogrammetryDimensions) => {
        callback(event);
      }
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
