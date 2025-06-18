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
  type ObjectCapturePointCloudViewRef,
} from 'react-native-object-capture';
import { objectCaptureViewRef } from './utils';
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

  const handleContinue = () => {
    // either call beginNewScan or beginNewScanAfterFlip
    // TODO: figure out the logic that determines which
    Alert.alert('Flip object?', 'Do you want to flip the object?', [
      {
        text: 'Flip',
        onPress: () => {
          objectCaptureViewRef.current?.beginNewScanAfterFlip();
          objectCaptureViewRef.current?.resumeSession();
          navigation.goBack();
        },
      },
      {
        text: 'No',
        onPress: () => {
          objectCaptureViewRef.current?.beginNewScan();
          objectCaptureViewRef.current?.resumeSession();
          navigation.goBack();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleFinish = () => {
    try {
      objectCaptureViewRef.current?.finishSession();
      navigation.popToTop();
      navigation.navigate('PhotogrammetrySessionScreen');
    } catch (err) {
      console.error('Failed to finish session:', err);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  useEffect(() => {
    objectCaptureViewRef.current?.pauseSession();
    objectCaptureViewRef.current?.getNumberOfScanPassUpdates().then((count) => {
      console.log('count', count);
      setNumberOfScanPassUpdates(count);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>ScanPassStageModal</Text>
      <Text>Segments Completed: {numberOfScanPassUpdates}</Text>

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

      <Pressable style={styles.button} onPress={handleCancel}>
        <Text>Cancel</Text>
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
