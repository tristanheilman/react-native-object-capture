import { useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { QuickLookView } from 'react-native-object-capture';
import { colors } from './theme';

type ModelOutputScreenProps = {
  navigation: any;
  route: any;
};

export default function ModelOutputScreen({
  navigation,
  route,
}: ModelOutputScreenProps) {
  const { path, name } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: name ? name.replace(/\.usdz$/i, '') : 'Model',
    });
  }, [navigation, name]);

  return (
    <View style={styles.container}>
      <QuickLookView path={path} style={styles.quickLookView} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickLookView: {
    flex: 1,
  },
});
