import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import usePhotogrammetrySession from '../hooks/usePhotogrammetrySession';

const PhotogrammetrySession = () => {
  const {
    error,
    progress,
    result,
    imageDirectoryContents,
    checkpointDirectoryContents,
    outputDirectoryContents,
    startReconstruction,
  } = usePhotogrammetrySession({
    imagesDirectory: 'Images/',
    checkpointDirectory: 'Snapshots/',
    outputPath: 'Outputs/model.usdz',
  });

  console.log('imageDirectoryContents', imageDirectoryContents);
  console.log('checkpointDirectoryContents', checkpointDirectoryContents);
  console.log('outputDirectoryContents', outputDirectoryContents);
  console.log('result', result);
  console.log('error', error);
  console.log('progress', progress);

  return (
    <View style={styles.container}>
      {progress === 0 ? (
        <Pressable style={styles.button} onPress={startReconstruction}>
          <Text>Start Reconstruction</Text>
        </Pressable>
      ) : (
        result === null &&
        error === null && <ActivityIndicator size="large" color="blue" />
      )}
      {error && <Text style={styles.error}>Error: {error?.message}</Text>}
      <Text style={styles.text}>Progress: {progress}</Text>
      <Text style={styles.text}>Result: {result || 'No result'}</Text>
    </View>
  );
};

export default PhotogrammetrySession;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#CD8987',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 5,
  },
  text: {
    color: 'blue',
  },
  error: {
    color: 'red',
  },
});
