import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ObjectCapturePointCloudView } from 'react-native-object-capture';
import { objectCaptureViewRef } from './utils';
type ObjectSessionHelpModalProps = {
  navigation: any;
};

export default function ObjectSessionHelpModal({
  navigation,
}: ObjectSessionHelpModalProps) {
  const handleResumeSession = async () => {
    await objectCaptureViewRef.current?.resumeSession();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>Object Session Help</Text>

      <ObjectCapturePointCloudView />

      <Pressable style={styles.button} onPress={handleResumeSession}>
        <Text>Resume Session</Text>
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
