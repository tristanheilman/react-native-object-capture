import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ObjectCapturePointCloudView,
  type ObjectCapturePointCloudViewRef,
} from 'react-native-object-capture';
import { objectCaptureViewRef } from './utils';
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

  const handleResumeSession = async () => {
    await objectCaptureViewRef.current?.resumeSession();
    navigation.goBack();
  };

  useEffect(() => {
    console.log('objectCaptureViewRef.current', objectCaptureViewRef.current);
    objectCaptureViewRef.current?.getNumberOfScanPassUpdates().then((count) => {
      console.log('count', count);
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
        // onAppear={getSessionState}
        // onCloudPointViewAppear={getSessionState}
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
