import { Text, View, StyleSheet, Pressable } from 'react-native';

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate('ObjectCaptureView');
        }}
      >
        <Text>Open Object Capture View</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate('ScanPassStageModal');
        }}
      >
        <Text>Open ScanPassStageModal</Text>
      </Pressable>
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
  button: {
    backgroundColor: '#CD8987',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 5,
  },
});
