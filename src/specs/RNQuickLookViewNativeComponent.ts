import type { HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

/** Codegen spec for the native QuickLook (USDZ preview) view. */

export interface NativeProps extends ViewProps {
  /** Path to the model file to preview. */
  path?: string;
}

export default codegenNativeComponent<NativeProps>(
  'RNQuickLookView'
) as HostComponent<NativeProps>;
