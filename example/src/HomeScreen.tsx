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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
});
