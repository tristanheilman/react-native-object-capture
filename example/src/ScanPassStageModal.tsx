import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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

type ScanPassStageModalProps = {
  navigation: any;
};

export default function ScanPassStageModal({
  navigation,
}: ScanPassStageModalProps) {
  const pointCloudViewRef = useRef<ObjectCapturePointCloudViewRef>(null);
  const { width, height } = useWindowDimensions();
  const [numberOfScanPassUpdates, setNumberOfScanPassUpdates] = useState(-1);
  const [numberOfShots, setNumberOfShots] = useState(-1);

  const handleContinue = () => {
    // either call beginNewScan or beginNewScanAfterFlip
    // TODO: figure out the logic that determines which
    Alert.alert('Flip object?', 'Do you want to flip the object?', [
      {
        text: 'Flip',
        onPress: async () => {
          await ObjectCaptureSession.beginNewScanAfterFlip();
          await ObjectCaptureSession.resumeSession();
          navigation.goBack();
        },
      },
      {
        text: 'No',
        onPress: async () => {
          try {
            await ObjectCaptureSession.beginNewScan();
          } catch (err) {
            Alert.alert('Cannot start a new pass', String(err));
            return;
          }
          await ObjectCaptureSession.resumeSession();
          navigation.goBack();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleFinish = async () => {
    try {
      await ObjectCaptureSession.finishSession();
      navigation.popToTop();
      navigation.navigate('PhotogrammetrySessionScreen');
    } catch (err) {
      console.error('Failed to finish session:', err);
    }
  };

  useEffect(() => {
    ObjectCaptureSession.getNumberOfScanPassUpdates().then((count) => {
      setNumberOfScanPassUpdates(count);
    });
    ObjectCaptureSession.getNumberOfShotsTaken().then(setNumberOfShots);
  }, []);

  return (
    <View style={styles.container}>
      <Text>ScanPassStageModal</Text>
      <Text>Scan passes completed: {numberOfScanPassUpdates}</Text>
      <Text>Photos captured so far: {numberOfShots}</Text>

      <ObjectCapturePointCloudView
        ref={pointCloudViewRef}
        checkpointDirectory={'Snapshots/'}
        imagesDirectory={'Images/'}
        // height and width must be set for the cloud point view to render
        style={{
          height: height / 2,
          width: width,
        }}
        // onAppear={getSessionState}
        // onCloudPointViewAppear={getSessionState}
        ObjectCaptureEmptyComponent={EmptyObjectCapture}
        ObjectCaptureLoadingComponent={LoadingObjectCapture}
      />

      <Pressable style={styles.button} onPress={handleContinue}>
        <Text>Continue</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleFinish}>
        <Text>Finish</Text>
      </Pressable>
      {/* No Cancel: once a pass completes, the session waits for a new pass,
          a flip, or finish. There is no state to go back to the same pass. */}
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
