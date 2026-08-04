import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  ObjectCapturePointCloudView,
  ObjectCaptureSession,
  type ObjectCapturePointCloudViewRef,
} from 'react-native-object-capture';
import EmptyObjectCapture from './components/EmptyObjectCapture';
import LoadingObjectCapture from './components/LoadingObjectCapture';

type ObjectSessionHelpModalProps = {
  navigation: any;
};

export default function ObjectSessionHelpModal({
  navigation,
}: ObjectSessionHelpModalProps) {
  const [numberOfScanPassUpdates, setNumberOfScanPassUpdates] = useState(-1);
  const pointCloudViewRef = useRef<ObjectCapturePointCloudViewRef>(null);
  const { width, height } = useWindowDimensions();

  const handleResumeSession = async () => {
    await ObjectCaptureSession.resumeSession();
    navigation.goBack();
  };

  useEffect(() => {
    ObjectCaptureSession.getNumberOfScanPassUpdates().then((count) => {
      setNumberOfScanPassUpdates(count);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Object Session Help</Text>

      <ObjectCapturePointCloudView
        ref={pointCloudViewRef}
        imagesDirectory="Images/"
        checkpointDirectory="Snapshots/"
        // height and width must be set for the point cloud view to render
        style={{ height: height / 2, width }}
        ObjectCaptureEmptyComponent={EmptyObjectCapture}
        ObjectCaptureLoadingComponent={LoadingObjectCapture}
      />

      <Text>Number of Scan Pass Updates: {numberOfScanPassUpdates}</Text>

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
