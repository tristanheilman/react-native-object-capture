import { View, type ViewStyle, Platform } from 'react-native';
import RNQuickLookView from '../specs/RNQuickLookViewNativeComponent';

export interface QuickLookViewProps {
  testID?: string;
  style?: ViewStyle;
  path: string;
}

const QuickLookView = ({
  style,
  testID = 'RNQuickLookView',
  path,
}: QuickLookViewProps) => {
  if (Platform.OS !== 'ios') {
    console.warn('RNQuickLookView is only available on iOS');
    return null;
  }

  return (
    <View style={style}>
      <RNQuickLookView testID={testID} style={style} path={path} />
    </View>
  );
};

export default QuickLookView;
