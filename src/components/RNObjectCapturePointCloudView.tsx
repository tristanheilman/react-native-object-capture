import React, { useImperativeHandle } from 'react';
import { useEffect, forwardRef, useRef, useState } from 'react';
import {
  View,
  requireNativeComponent,
  type ViewStyle,
  type NativeSyntheticEvent,
  Platform,
  findNodeHandle,
  NativeModules,
} from 'react-native';
import {
  type SessionState,
  type OnAppearEvent,
  type OnCloudPointViewAppearEvent,
} from '../NativeObjectCapture';

export interface ObjectCapturePointCloudViewProps {
  testID?: string;
  style?: ViewStyle;
  checkpointDirectory: string;
  imagesDirectory: string;
  onAppear?: (event: NativeSyntheticEvent<OnAppearEvent>) => void;
  onCloudPointViewAppear?: (
    event: NativeSyntheticEvent<OnCloudPointViewAppearEvent>
  ) => void;
  ObjectCaptureEmptyComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
  ObjectCaptureLoadingComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
}

export interface ObjectCapturePointCloudViewRef {
  getSessionState: () => Promise<SessionState>;
  getUserCompletedScanPass: () => Promise<boolean>;
}

// Define the native module interface
interface RNObjectCapturePointCloudViewModule {
  getSessionState: (node: number) => Promise<SessionState>;
  getUserCompletedScanPass: (node: number) => Promise<boolean>;
}

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
>(
  (
    {
      style,
      testID = 'RNObjectCapturePointCloudView',
      checkpointDirectory,
      imagesDirectory,
      ObjectCaptureEmptyComponent,
      ObjectCaptureLoadingComponent,
      onAppear,
      onCloudPointViewAppear,
    },
    ref
  ) => {
    const viewRef = useRef(null);
    const nativeModule = useRef<RNObjectCapturePointCloudViewModule | null>(
      null
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [isScanPassCompleted, setIsScanPassCompleted] =
      useState<boolean>(false);

    const checkScanPass = async () => {
      if (!nativeModule.current || !viewRef.current) {
        throw new Error('View or native module not found');
      }
      const node = findNodeHandle(viewRef.current);
      if (!node) {
        throw new Error('View node not found');
      }
      const completed =
        await nativeModule.current.getUserCompletedScanPass(node);
      setIsScanPassCompleted(completed);
      _onAppear?.({
        nativeEvent: {
          scanPassCompleted: completed,
        },
      } as NativeSyntheticEvent<any>);
      setLoading(false);
    };

    useEffect(() => {
      if (Platform.OS === 'ios') {
        nativeModule.current =
          NativeModules.RNObjectCapturePointCloudView as RNObjectCapturePointCloudViewModule;
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
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
        getUserCompletedScanPass: async () => {
          if (!nativeModule.current || !viewRef.current) {
            throw new Error('View or native module not found');
          }
          const node = findNodeHandle(viewRef.current);
          if (!node) {
            throw new Error('View node not found');
          }
          return nativeModule.current.getUserCompletedScanPass(node);
        },
      }),
      []
    );

    const _onAppear = (event: NativeSyntheticEvent<OnAppearEvent>) => {
      onAppear?.(event);
    };

    const _onCloudPointViewAppear = (
      event: NativeSyntheticEvent<OnCloudPointViewAppearEvent>
    ) => {
      onCloudPointViewAppear?.(event);
    };

    if (!RNObjectCapturePointCloudView || Platform.OS !== 'ios') {
      console.warn('RNObjectCapturePointCloudView is not available');
      return null;
    }

    return (
      <View style={style}>
        <RNObjectCapturePointCloudView
          testID={testID}
          ref={viewRef}
          style={style}
          checkpointDirectory={checkpointDirectory}
          imagesDirectory={imagesDirectory}
          onAppear={checkScanPass}
          onCloudPointViewAppear={_onCloudPointViewAppear}
        />
        {loading && ObjectCaptureLoadingComponent ? (
          typeof ObjectCaptureLoadingComponent === 'function' ? (
            <ObjectCaptureLoadingComponent />
          ) : (
            ObjectCaptureLoadingComponent
          )
        ) : !loading && !isScanPassCompleted && ObjectCaptureEmptyComponent ? (
          typeof ObjectCaptureEmptyComponent === 'function' ? (
            <ObjectCaptureEmptyComponent />
          ) : (
            ObjectCaptureEmptyComponent
          )
        ) : null}
      </View>
    );
  }
);

export default ObjectCapturePointCloudView;
