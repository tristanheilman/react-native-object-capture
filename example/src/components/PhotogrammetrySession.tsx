import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import usePhotogrammetrySession from '../hooks/usePhotogrammetrySession';

const PhotogrammetrySession = () => {
  const { error, progress, result } = usePhotogrammetrySession({
    inputPath: 'Images/',
    checkpointPath: 'Snapshots/',
    outputPath: 'Reconstruction/model.usdz',
  });

  return (
    <View style={styles.container}>
      {result === null && error === null && (
        <ActivityIndicator size="large" color="blue" />
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
  text: {
    color: 'blue',
  },
  error: {
    color: 'red',
  },
});
