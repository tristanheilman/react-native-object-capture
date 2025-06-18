# react-native-object-capture

> ⚠️ **WARNING: This library is currently in active development and is NOT ready for production use.**
> 
> - The implementation is incomplete and may contain bugs
> - API changes are likely to occur
> - Some features may not work as expected
> - Testing has been limited to specific devices and scenarios
> 
> Use at your own risk and expect breaking changes in future releases.

[![CI](https://github.com/tristanheilman/react-native-object-capture/actions/workflows/ci.yml/badge.svg)](https://github.com/tristanheilman/react-native-object-capture/actions/workflows/ci.yml)

AR object capture session for React Native using Apple's Object Capture API. This library provides a React Native wrapper for capturing 3D objects using the device's camera. **This library does not currently work for Android.**

## Requirements

- iOS 17.0 or later
- iPhone 12 Pro or newer (devices with LiDAR sensor)
- React Native 0.76.0 or later

## Installation
1. Install library

    from npm
    ```
    npm install react-native-object-capture
    ```

    from yarn
    ```
    yarn add react-native-object-capture
    ```

2. Link native code
```
cd ios && pod install
```

## Components

### ObjectCaptureView

The main component for capturing 3D objects. It provides a camera interface with real-time feedback and controls for the capture process.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `ref` | RefObject<ObjectCapturePointCloudViewRef> | No | Ref object to access view methods |
| `style` | ViewStyle | Yes | Style object for the cloud point view container |
| `checkpointDirectory` | String | Yes | Directory to use for the object capture session |
| `imagesDirectory` | String | Yes | Directory to use to save image captures during object capture session |
| `onCaptureComplete` | (evt: `NativeSyntheticEvent<CaptureComplete>`) => void | No | Callback fired when object capture is complete |
| `onScanPassCompleted` | (evt: `NativeSyntheticEvent<ScanPassCompleted>`) => void | No | Callback fired when a scan pass is completed. It is recommended to complete 3 scan pass' before finishing the object capture session |
| `onSessionStateChange` | (evt: `NativeSyntheticEvent<SessionStateChange>`) => void | No | Callback fired when the capture session state changes |
| `onTrackingStateChange` | (evt: `NativeSyntheticEvent<TrackingStateChange>`) => void | No | Callback fired when the tracking state changes |
| `onFeedbackStateChange` | (evt: `NativeSyntheticEvent<TrackingStateChange>`) => void | No | Callback fired when the feedback state changes |
| `onError` | (evt: `NativeSyntheticEvent<SessionError>`) => void | No | Callback fired when an error occurs during capture |

#### Methods

| Method | Description |
|--------|-------------|
| `resumeSession` | Resumes a paused session |
| `pauseSession` | Pauses a session |
| `startDetection` | When called the current Object Capture Session will begin detecting objects in the current view |
| `resetDetection` | When called the current Object Capture Session will reset any detected objects |
| `startCapturing` | When called the Object Capture Session will transition from SessionState.detecting to SessionState.capturing |
| `beginNewScanAfterFlip` | If the object is flippable, then calling this method will begin a new capture session to capture a new orientation of the object |
| `beginNewScan` | When called this method will begin a new scan for the Object Capture Session |
| `cancelSession` | Call this method when cleaning up and tearing down the Object Capture Session |
| `isDeviceSupported` | Resumes boolean value indicating if the device supports AR and LiDAR |
| `getSessionState` | Returns the current SessionState |
| `getTrackingState` | Returns the current TrackingState |
| `getFeedbackState` | Returns the current FeedbackState |
| `getNumberOfShotsTaken` | Returns integer count of images taken for current Object Capture Session |
| `getUserCompletedScanState` | Returns boolean if the current scan pass is completed |
| `getNumberOfScanPassUpdates` | Returns the number of scan pass' completed |

#### Example

```jsx
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  ObjectCaptureView,
  type SessionState,
  type FeedbackState,
  type TrackingState,
  type SessionStateChange,
  type FeedbackStateChange,
  type TrackingStateChange,
  type SessionError,
  type CaptureComplete,
  type ScanPassCompleted,
} from 'react-native-object-capture';
import { objectCaptureViewRef } from './utils';

type ObjectSessionScreenProps = {
  navigation: any;
};

export default function ObjectSessionScreen({
  navigation,
}: ObjectSessionScreenProps) {
  const [sessionState, setSessionState] =
    useState<SessionState>('initializing');
  const [trackingState, setTrackingState] =
    useState<TrackingState>('notAvailable');
  const [feedbackState, setFeedbackState] = useState<FeedbackState[]>([]);
  const [numberOfScanPassCompleted, setNumberOfScanPassCompleted] = useState(0);

  const handleSessionStateChange = (
    event: NativeSyntheticEvent<SessionStateChange>
  ) => {
    console.log('Session state changed to:', event.nativeEvent);
    setSessionState(event.nativeEvent.state);
  };

  const handleFeedbackStateChange = (
    event: NativeSyntheticEvent<FeedbackStateChange>
  ) => {
    console.log('Feedback state changed to:', event.nativeEvent);
    setFeedbackState(event.nativeEvent.feedback);
  };

  const handleTrackingStateChange = (
    event: NativeSyntheticEvent<TrackingStateChange>
  ) => {
    console.log('Tracking state changed to:', event.nativeEvent);
    setTrackingState(event.nativeEvent.tracking);
  };

  const handleCaptureComplete = (
    event: NativeSyntheticEvent<CaptureComplete>
  ) => {
    console.log('Capture completed:', event.nativeEvent);
  };

  const handleScanPassCompleted = (
    event: NativeSyntheticEvent<ScanPassCompleted>
  ) => {
    console.log('Scan pass completed:', event.nativeEvent);
    setNumberOfScanPassCompleted(numberOfScanPassCompleted + 1);
    objectCaptureViewRef.current?.pauseSession();
    navigation.navigate('ScanPassStageModal');
  };

  const handleError = (event: NativeSyntheticEvent<SessionError>) => {
    console.error('Error:', event.nativeEvent.error);
  };

  const handleStartDetection = async () => {
    await objectCaptureViewRef.current?.startDetection();
  };

  const handleResetDetection = async () => {
    await objectCaptureViewRef.current?.resetDetection();
  };

  const handleStartCapturing = async () => {
    await objectCaptureViewRef.current?.startCapturing();
  };

  const handleCancelSession = async () => {
    await objectCaptureViewRef.current?.cancelSession();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ObjectCaptureView
        ref={objectCaptureViewRef}
        style={styles.container}
        checkpointDirectory={'Snapshots/'}
        imagesDirectory={'Images/'}
        onSessionStateChange={handleSessionStateChange}
        onFeedbackStateChange={handleFeedbackStateChange}
        onTrackingStateChange={handleTrackingStateChange}
        onScanPassCompleted={handleScanPassCompleted}
        onCaptureComplete={handleCaptureComplete}
        onError={handleError}
      />
      
      {/* Add your UI controls here */}
    </View>
  );
}
```

### ObjectCapturePointCloudView

Displays a real-time point cloud visualization of the captured object. This component is useful for providing visual feedback during the capture process.

#### Props

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `ref` | RefObject<ObjectCapturePointCloudViewRef> | No | Ref object to access view methods |
| `style` | ViewStyle | Yes | Style object for the cloud point view container |
| `checkpointDirectory` | String | Yes | Directory that was used for the object capture session |
| `imagesDirectory` | String | Yes | Directory that was used to save image captures during object capture session |
| `onAppear` | () => void | No | Callback fired when the view appears |
| `onCloudPointViewAppear` | () => void | No | Callback fired when the cloud point visualization appears |
| `ObjectCaptureEmptyComponent` | ComponentType | No | Component to render when no point cloud data is available |
| `ObjectCaptureLoadingComponent` | ComponentType | No | Component to render while point cloud data is loading |

#### Example

```jsx
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
    // Call beginNewScanAfterFlip or beginNewScan
    // objectCaptureViewRef.current?.beginNewScanAfterFlip();
    // objectCaptureViewRef.current?.resumeSession();
    // navigation.goBack();

    objectCaptureViewRef.current?.beginNewScan();
    objectCaptureViewRef.current?.resumeSession();
    navigation.goBack();
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
        // height and width must be set for 
        // the cloud point view to render
        style={{
          height: height / 2,
          width: width,
        }}
        ObjectCaptureEmptyComponent={EmptyObjectCapture}
        ObjectCaptureLoadingComponent={LoadingObjectCapture}
      />

      {/* Add your UI controls here */}
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
```

### QuickLookView

Displays a QLPreviewController for the selected model file passed as a prop.

#### Props

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | String | Yes | The path to the model file |
| `style` | ViewStyle | Yes | Style object for the cloud point view container |

#### Example

```jsx
import { StyleSheet, Text, View } from 'react-native';
import { QuickLookView } from 'react-native-object-capture';

type ModelOutputScreenProps = {
  route: any;
};

export default function ModelOutputScreen({ route }: ModelOutputScreenProps) {
  const { path } = route.params;

  return (
     <QuickLookView path={path} style={styles.quickLookView} />
  );
}

const styles = StyleSheet.create({
  quickLookView: {
    width: '100%',
    height: '100%',
  },
});
```

### PhotogrammetrySession

Handles the processing of captured images into a 3D model. This component manages the reconstruction process and provides progress updates.

#### Event Listeners

| Event Listener | Callback | Description |
|-------|------|-------------|
| `addProgressListner` | (progress: number) => void | Fired when reconstruction progress updates |
| `addCompleteListener` | () => void | Fired when reconstruction is successfully completed |
| `addErrorListener` | (error: string) => void | Fired when an error occurs during reconstruction |
| `addCancelledListener` | () => void | Fired when reconstruction is cancelled |
| `addRequestCompletListener` | () => void | Fired when request is completed |
| `addInputCompleteListener` | () => void | Fired when input processing is completed |
| `addInvalidSampleListener` | ({ id: string, reason: string }) | Fired when a sample is invalid |
| `addSkippedSampleListener` | ({ id: string }) => void | Fired when a sample is skipped |
| `addAutomaticDownsamplingListener` | () => void | Fired when automatic downsampling occurs |
| `addProcessingCancelledListener` | () => void | Fired when processing is cancelled |
| `addUnknownOutputListener` | () => void | Fired when output type is unknown |

#### Methods
| Method | Paramaters | Description |
|--------|------------|-------------|
| `startReconstruction` | (config: ReconstructionConfig) => void | Starts the 3D model reconstruction process |
| `cancelReconstruction` | () => void | Cancels an ongoing reconstruction |
| `removeAllListeners` | () => void | Call this to cleanup any added listeners |

```jsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  PhotogrammetrySession,
  type PhotogrammetrySessionOptions,
} from 'react-native-object-capture';

export default function PhotogrammetryScreen() {
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<string | null>(null);

  const handleStartReconstruction = async () => {
    try {
      await PhotogrammetrySession.startReconstruction({
        imagesDirectory: 'Images/',
        checkpointDirectory: 'Snapshots/',
        outputPath: 'Reconstruction/model.usdz',
      });
    } catch (error) {
      console.error('Reconstruction failed:', error);
    }
  };

  const cancelReconstruction = async () => {
    await PhotogrammetrySession.cancelReconstruction();
  };

  useEffect(() => {
    PhotogrammetrySession.addProgressListener((currProgress) => {
      setProgress(currProgress);
    });
    PhotogrammetrySession.addErrorListener((err) => {
      console.log('error', err);
      setError(new Error(err));
    });
    PhotogrammetrySession.addCompleteListener(() => {
      setResult('completed');
    });
    PhotogrammetrySession.addCancelledListener(() => {
      setResult('cancelled');
    });

    return () => {
      PhotogrammetrySession.cancelReconstruction();
      PhotogrammetrySession.removeAllListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Photogrammetry Session</Text>
      {/* Add your UI controls here */}
    </View>
  );
}
```

## Session States

The `ObjectCaptureView` component emits state changes through the `onSessionStateChange` callback. The possible states are:

- `initializing`: The session is being set up
- `ready`: The session is ready to start capturing
- `detecting`: The session is detecting a bounding box for an object
- `capturing`: The session is actively capturing images
- `processing`: The captured images are being processed
- `completed`: The capture and processing are complete
- `failed`: An error occurred during the capture process

## Feedback State

The `ObjectCaptureView` component emits feedback changes through the `onFeedbackStateChange` callback. The possible states are:

- `objectTooClose` : The detected object is too close to the camera
- `objectTooFar` : The detected object is too far from the camera
- `movingTooFast` : The camera capture session is panning too quickly to capture accurately
- `enviornmentLowLight` : The capture enviornment does not have sufficient lighting for accurate object capture
- `enviornmentTooDark` : The capture enviornment does not have sufficient lighting for any object capturing
- `objectNotFlippable` : The detected object is not flippable
-  `overCapturing` : The current session has overcaptured for the current scan pass
- `objectNotDetected` : The capture session can not find the defined / detected object

## Tracking State

The `ObjectCaptureView` component emits state changes through the `onTrackingStateChange` callback. The possible states are:

- `notAvailable` : Tracking is not currently availalbe
- `limited` : Tracking is limited with current conditions
- `normal` : Tracking is not blocked by any conditions

## Permissions

Add the following keys to your `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to capture 3D objects</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to save captured 3D objects</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app needs photo library access to save captured 3D objects</string>
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)