import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import usePhotogrammetrySession from '../hooks/usePhotogrammetrySession';
import { useState } from 'react';

const PhotogrammetrySession = () => {
  const [modelName, setModelName] = useState('model.usdz');
  const { error, progress, result, startReconstruction, cancelReconstruction } =
    usePhotogrammetrySession();

  console.log('progress', progress, typeof progress);
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.labelText}>Model Name</Text>
        <TextInput
          style={styles.input}
          value={modelName}
          onChangeText={setModelName}
        />
      </View>
      {progress > 0 && progress < 1 ? (
        <View style={styles.progressContainer}>
          <Pressable style={styles.button} onPress={cancelReconstruction}>
            <Text>Cancel Reconstruction</Text>
          </Pressable>
          <Text style={styles.progressText}>
            Progress: {(progress * 100)?.toFixed(2)}%
          </Text>
        </View>
      ) : (
        result !== 'completed' && (
          <Pressable
            style={styles.button}
            onPress={() =>
              startReconstruction({
                imagesDirectory: 'Images/',
                checkpointDirectory: 'Snapshots/',
                outputPath: `Outputs/${modelName}`,
              })
            }
          >
            <Text>Start Reconstruction</Text>
          </Pressable>
        )
      )}
      {error && <Text style={styles.error}>Error: {error?.message}</Text>}
      <Text style={styles.resultText}>Result: {result || 'No result yet'}</Text>
    </View>
  );
};

export default PhotogrammetrySession;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 20,
    width: '100%',
    gap: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  button: {
    backgroundColor: '#CD8987',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 5,
  },
  inputContainer: {
    width: '100%',
    gap: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 15,
    borderRadius: 5,
    width: '100%',
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultText: {
    fontSize: 20,
  },
  error: {
    color: 'red',
  },
});
