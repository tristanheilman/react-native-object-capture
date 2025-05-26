import { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import {
  requireNativeComponent,
  type ViewStyle,
  Platform,
  findNodeHandle,
  NativeModules,
} from 'react-native';
import { useObjectCapture, type SessionState } from '../NativeObjectCapture';

export interface ObjectCaptureViewProps {
  style?: ViewStyle;
  onSessionStateChange?: (state: SessionState) => void;
  onCaptureComplete?: (result: { url: string }) => void;
  onError?: (error: { message: string }) => void;
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
>(({ style, onSessionStateChange, onCaptureComplete, onError }, ref) => {
  const { sessionState } = useObjectCapture();
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

  useEffect(() => {
    onSessionStateChange?.(sessionState);
  }, [sessionState, onSessionStateChange]);

  if (!RNObjectCaptureView) {
    console.warn('RNObjectCaptureView is not available');
    return null;
  }

  return (
    <RNObjectCaptureView
      ref={viewRef}
      style={style}
      onCaptureComplete={onCaptureComplete}
      onError={onError}
    />
  );
});

export default ObjectCaptureView;
