import { Pressable, StyleSheet, Text, View } from 'react-native';
import PhotogrammetrySession from './components/PhotogrammetrySession';

type PhotogrammetrySessionScreenProps = {
  navigation: any;
};

export default function PhotogrammetrySessionScreen({
  navigation,
}: PhotogrammetrySessionScreenProps) {
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>Photogrammetry Session Screen</Text>

      <PhotogrammetrySession />

      <Pressable style={styles.button} onPress={handleGoBack}>
        <Text>Go Back</Text>
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
