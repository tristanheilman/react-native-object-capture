import React, { useImperativeHandle } from 'react';
import { forwardRef, useState } from 'react';
import {
  View,
  type ViewStyle,
  type NativeSyntheticEvent,
  Platform,
} from 'react-native';
import {
  type SessionState,
  type OnAppearEvent,
  type OnCloudPointViewAppearEvent,
} from '../NativeObjectCapture';
import RNObjectCapturePointCloudView from '../specs/RNObjectCapturePointCloudViewNativeComponent';
import ObjectCaptureSession from '../modules/ObjectCaptureSession';

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
    const [loading, setLoading] = useState<boolean>(true);
    const [isScanPassCompleted, setIsScanPassCompleted] =
      useState<boolean>(false);

    // Both of these read from the shared session, not from this view instance.
    useImperativeHandle(
      ref,
      () => ({
        getSessionState: ObjectCaptureSession.getSessionState,
        getUserCompletedScanPass:
          ObjectCaptureSession.getUserCompletedScanState,
      }),
      []
    );

    const checkScanPass = async () => {
      const completed = await ObjectCaptureSession.getUserCompletedScanState();
      setIsScanPassCompleted(completed);
      onAppear?.({
        nativeEvent: { scanPassCompleted: completed },
      } as NativeSyntheticEvent<OnAppearEvent>);
      setLoading(false);
    };

    if (Platform.OS !== 'ios') {
      console.warn('RNObjectCapturePointCloudView is only available on iOS');
      return null;
    }

    return (
      <View style={style}>
        <RNObjectCapturePointCloudView
          testID={testID}
          style={style}
          checkpointDirectory={checkpointDirectory}
          imagesDirectory={imagesDirectory}
          onAppear={checkScanPass}
          onCloudPointViewAppear={onCloudPointViewAppear}
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
