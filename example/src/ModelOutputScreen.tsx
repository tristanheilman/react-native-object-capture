import { StyleSheet, Text, View } from 'react-native';
import { QuickLookView } from 'react-native-object-capture';

type ModelOutputScreenProps = {
  navigation: any;
  route: any;
};

export default function ModelOutputScreen({ route }: ModelOutputScreenProps) {
  const { path } = route.params;

  console.log('path', path);
  return (
    <View style={styles.container}>
      <Text>Model Output Screen</Text>

      <QuickLookView path={path} style={styles.quickLookView} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 10,
  },
  quickLookView: {
    width: '100%',
    height: '100%',
  },
});
