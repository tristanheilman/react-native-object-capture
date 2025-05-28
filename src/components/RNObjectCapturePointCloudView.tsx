import { useEffect, forwardRef, useRef } from 'react';
import {
  requireNativeComponent,
  type ViewStyle,
  Platform,
  NativeModules,
} from 'react-native';

export interface ObjectCapturePointCloudViewProps {
  style?: ViewStyle;
}

export interface ObjectCapturePointCloudViewRef {}

// Define the native module interface
interface RNObjectCapturePointCloudViewModule {}

// Only require the native component on iOS
const RNObjectCapturePointCloudView = Platform.select({
  ios: () => {
    try {
      return requireNativeComponent<ObjectCapturePointCloudViewProps>(
        'RNObjectCapturePointCloudView'
      );
    } catch (e) {
      console.error('Failed to load RNObjectCapturePointCloudView:', e);
      return null;
    }
  },
  default: () => null,
})();

const ObjectCapturePointCloudView = forwardRef<
  ObjectCapturePointCloudViewRef,
  ObjectCapturePointCloudViewProps
>(({ style }, _) => {
  //useObjectCapture();
  const viewRef = useRef(null);
  const nativeModule = useRef<RNObjectCapturePointCloudViewModule | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      nativeModule.current =
        NativeModules.RNObjectCapturePointCloudView as RNObjectCapturePointCloudViewModule;
    }
  }, []);

  // useImperativeHandle(
  //   ref,
  //   () => ({

  //   }),
  //   []
  // );

  if (!RNObjectCapturePointCloudView) {
    console.warn('RNObjectCapturePointCloudView is not available');
    return null;
  }

  return <RNObjectCapturePointCloudView ref={viewRef} style={style} />;
});

export default ObjectCapturePointCloudView;
