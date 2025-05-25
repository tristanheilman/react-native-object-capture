// src/components/ObjectCaptureView.tsx
import React, { useEffect } from 'react';
import { requireNativeComponent, type ViewStyle, Platform } from 'react-native';
import { useObjectCapture, type SessionState } from '../NativeObjectCapture';

export interface ObjectCaptureViewProps {
  style?: ViewStyle;
  onSessionStateChange?: (state: SessionState) => void;
  onCaptureComplete?: (result: { url: string }) => void;
  onError?: (error: { message: string }) => void;
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

const ObjectCaptureView: React.FC<ObjectCaptureViewProps> = ({
  style,
  onSessionStateChange,
  onCaptureComplete,
  onError,
}) => {
  const { sessionState } = useObjectCapture();

  useEffect(() => {
    onSessionStateChange?.(sessionState);
  }, [sessionState, onSessionStateChange]);

  if (!RNObjectCaptureView) {
    console.warn('RNObjectCaptureView is not available');
    return null;
  }

  return (
    <RNObjectCaptureView
      style={style}
      onCaptureComplete={onCaptureComplete}
      onError={onError}
    />
  );
};

export default ObjectCaptureView;
