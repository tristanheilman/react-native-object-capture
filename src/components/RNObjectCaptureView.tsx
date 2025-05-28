import { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import {
  requireNativeComponent,
  type ViewStyle,
  type NativeSyntheticEvent,
  Platform,
  findNodeHandle,
  NativeModules,
} from 'react-native';
import {
  type SessionState,
  type TrackingState,
  type FeedbackState,
  type FeedbackStateChange,
  type TrackingStateChange,
  type SessionStateChange,
  type CaptureComplete,
  type SessionError,
} from '../NativeObjectCapture';

export interface ObjectCaptureViewProps {
  style?: ViewStyle;
  onSessionStateChange?: (
    event: NativeSyntheticEvent<SessionStateChange>
  ) => void;
  onTrackingStateChange?: (
    event: NativeSyntheticEvent<TrackingStateChange>
  ) => void;
  onFeedbackStateChange?: (
    event: NativeSyntheticEvent<FeedbackStateChange>
  ) => void;
  onCaptureComplete?: (event: NativeSyntheticEvent<CaptureComplete>) => void;
  onError?: (event: NativeSyntheticEvent<SessionError>) => void;
}

export interface ObjectCaptureViewRef {
  resumeSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  startDetection: () => Promise<void>;
  resetDetection: () => Promise<void>;
  startCapturing: () => Promise<void>;
  beginNewScanAfterFlip: () => Promise<void>;
  beginNewScan: () => Promise<void>;
  finishSession: () => Promise<void>;
  cancelSession: () => Promise<void>;
  getTrackingState: () => Promise<TrackingState>;
  getFeedbackState: () => Promise<FeedbackState[]>;
  getNumberOfShotsTaken: () => Promise<number>;
  getUserCompletedScanState: () => Promise<boolean>;
  isDeviceSupported: () => Promise<boolean>;
  getSessionState: () => Promise<SessionState>;
}

// Define the native module interface
interface RNObjectCaptureViewModule {
  resumeSession: (node: number) => Promise<void>;
  pauseSession: (node: number) => Promise<void>;
  startDetection: (node: number) => Promise<void>;
  resetDetection: (node: number) => Promise<void>;
  startCapturing: (node: number) => Promise<void>;
  beginNewScanAfterFlip: (node: number) => Promise<void>;
  beginNewScan: (node: number) => Promise<void>;
  finishSession: (node: number) => Promise<void>;
  cancelSession: (node: number) => Promise<void>;
  getTrackingState: (node: number) => Promise<TrackingState>;
  getFeedbackState: (node: number) => Promise<FeedbackState[]>;
  getNumberOfShotsTaken: (node: number) => Promise<number>;
  getUserCompletedScanState: (node: number) => Promise<boolean>;
  isDeviceSupported: (node: number) => Promise<boolean>;
  getSessionState: (node: number) => Promise<SessionState>;
}

// Only require the native component on iOS
const RNObjectCaptureView = Platform.select({
  ios: () => {
    try {
      return requireNativeComponent<ObjectCaptureViewProps>(
        'RNObjectCaptureView'
      );
    } catch (e) {
      console.error('Failed to load RNObjectCaptureView:', e);
      return null;
    }
  },
  default: () => null,
})();

const ObjectCaptureView = forwardRef<
  ObjectCaptureViewRef,
  ObjectCaptureViewProps
>(
  (
    {
      style,
      onSessionStateChange,
      onTrackingStateChange,
      onFeedbackStateChange,
      onCaptureComplete,
      onError,
    },
    ref
  ) => {
    //useObjectCapture();
    const viewRef = useRef(null);
    const nativeModule = useRef<RNObjectCaptureViewModule | null>(null);

    useEffect(() => {
      if (Platform.OS === 'ios') {
        nativeModule.current =
          NativeModules.RNObjectCaptureView as RNObjectCaptureViewModule;
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        isDeviceSupported: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.isDeviceSupported(node);
        },
        getSessionState: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.getSessionState(node);
        },
        getTrackingState: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.getTrackingState(node);
        },
        getFeedbackState: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.getFeedbackState(node);
        },
        getNumberOfShotsTaken: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.getNumberOfShotsTaken(node);
        },
        getUserCompletedScanState: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.getUserCompletedScanState(node);
        },
        cancelSession: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.cancelSession(node);
        },
        resumeSession: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.resumeSession(node);
        },
        pauseSession: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.pauseSession(node);
        },
        startDetection: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.startDetection(node);
        },
        resetDetection: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.resetDetection(node);
        },
        startCapturing: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.startCapturing(node);
        },
        beginNewScanAfterFlip: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.beginNewScanAfterFlip(node);
        },
        beginNewScan: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.beginNewScan(node);
        },
        finishSession: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.finishSession(node);
        },
      }),
      []
    );

    const _onCaptureComplete = (
      event: NativeSyntheticEvent<CaptureComplete>
    ) => {
      onCaptureComplete?.(event);
    };

    const _onFeedbackStateChange = (
      event: NativeSyntheticEvent<FeedbackStateChange>
    ) => {
      onFeedbackStateChange?.(event);
    };

    const _onTrackingStateChange = (
      event: NativeSyntheticEvent<TrackingStateChange>
    ) => {
      onTrackingStateChange?.(event);
    };

    const _onSessionStateChange = (
      event: NativeSyntheticEvent<SessionStateChange>
    ) => {
      onSessionStateChange?.(event);
    };

    const _onError = (event: NativeSyntheticEvent<SessionError>) => {
      onError?.(event);
    };

    if (!RNObjectCaptureView) {
      console.warn('RNObjectCaptureView is not available');
      return null;
    }

    return (
      <RNObjectCaptureView
        ref={viewRef}
        style={style}
        onCaptureComplete={_onCaptureComplete}
        onFeedbackStateChange={_onFeedbackStateChange}
        onTrackingStateChange={_onTrackingStateChange}
        onSessionStateChange={_onSessionStateChange}
        onError={_onError}
      />
    );
  }
);

export default ObjectCaptureView;
