import type { HostComponent, ViewProps } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

/** Codegen spec for the native point cloud preview view. */

export type PointCloudAppearEvent = {
  scanPassCompleted: boolean;
};

export interface NativeProps extends ViewProps {
  checkpointDirectory?: string;
  imagesDirectory?: string;
  onAppear?: DirectEventHandler<PointCloudAppearEvent>;
  onCloudPointViewAppear?: DirectEventHandler<PointCloudAppearEvent>;
}

export default codegenNativeComponent<NativeProps>(
  'RNObjectCapturePointCloudView'
) as HostComponent<NativeProps>;
