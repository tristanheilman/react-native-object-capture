import { useRef } from 'react';
import {
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
  const handleContinue = () => {
    // either call beginNewScan or beginNewScanAfterFlip
    // TODO: figure out the logic that determines which
    objectCaptureViewRef.current?.beginNewScan();
    navigation.goBack();
  };

  const handleFinish = () => {
    objectCaptureViewRef.current?.finishSession();
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>ScanPassStageModal</Text>
      <Text>Segments Completed: 1</Text>

      <ObjectCapturePointCloudView
        ref={pointCloudViewRef}
        // height and width must be set for the cloud point view to render
        style={{ height: height / 2, width: width }}
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
