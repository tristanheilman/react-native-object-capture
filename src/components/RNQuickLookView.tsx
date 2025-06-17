import {
  View,
  requireNativeComponent,
  type ViewStyle,
  Platform,
} from 'react-native';

export interface QuickLookViewProps {
  style?: ViewStyle;
  path: string;
}

// Only require the native component on iOS
const RNQuickLookView = Platform.select({
  ios: () => {
    try {
      return requireNativeComponent<QuickLookViewProps>('RNQuickLookView');
    } catch (e) {
      console.error('Failed to load RNObjectCapturePointCloudView:', e);
      return null;
    }
  },
  default: () => null,
})();

const QuickLookView = ({ style, path }: QuickLookViewProps) => {
  if (!RNQuickLookView) {
    console.warn('RNQuickLookView is not available');
    return null;
  }

  return (
    <View style={style}>
      <RNQuickLookView style={style} path={path} />
    </View>
  );
};

export default QuickLookView;
