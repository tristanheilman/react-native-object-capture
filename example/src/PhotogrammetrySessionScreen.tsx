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
      <View style={styles.header}>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <Text>Go Back</Text>
        </Pressable>
        <Text style={styles.title}>Photogrammetry Session</Text>
      </View>

      <PhotogrammetrySession />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    gap: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  button: {
    backgroundColor: '#CD8987',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 5,
  },
});
