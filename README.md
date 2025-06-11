# react-native-object-capture

> ⚠️ **WARNING: This library is currently in active development and is NOT ready for production use.**
> 
> - The implementation is incomplete and may contain bugs
> - API changes are likely to occur
> - Some features may not work as expected
> - Testing has been limited to specific devices and scenarios
> 
> Use at your own risk and expect breaking changes in future releases.

AR object capture session for React Native using Apple's Object Capture API. This library provides a React Native wrapper for capturing 3D objects using the device's camera. This library does not currently work for Android.

## Requirements

- iOS 17.0 or later
- iPhone 12 Pro or newer (devices with LiDAR sensor)
- React Native 0.76.0 or later

## Installation

```sh
npm install react-native-object-capture

yarn add react-native-object-capture
```


## Components

### ObjectCaptureView

The main component for capturing 3D objects. It provides a camera interface with real-time feedback and controls for the capture process.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `ref` | RefObject<ObjectCapturePointCloudViewRef> | No | Ref object to access view methods |
| `onCaptureComplete` | (evt: NativeSyntheticEvent<CaptureComplete>) => void | No | Callback fired when object capture is complete |
| `onScanPassCompletd` | (evt: NativeSyntheticEvent<ScanPassCompleted>) => void | No | Callback fired when a scan pass is completed. It is recommended to complete 3 scan pass' before finishing the object capture session |
| `onSessionStateChange` | (evt: NativeSyntheticEvent<SessionStateChange>) => void | No | Callback fired when the capture session state changes |
| `onTrackingStateChange` | (evt: NativeSyntheticEvent<TrackingStateChange>) => void | No | Callback fired when the tracking state changes |
| `onFeedbackStateChange` | (evt: NativeSyntheticEvent<TrackingStateChange>) => void | No | Callback fired when the feedback state changes |
| `onError` | (error: { message: string }) => void | No | Callback fired when an error occurs during capture |

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

### Example

```jsx
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ObjectCaptureView,
  type SessionState,
  type ObjectCaptureViewRef,
} from 'react-native-object-capture';

export default function ObjectSessionScreen() {
  const objectCaptureViewRef = useRef<ObjectCaptureViewRef>(null);
  const [sessionState, setSessionState] = useState<SessionState>('initializing');

  const handleSessionStateChange = (state: SessionState) => {
    setSessionState(state);
  };

  const handleCaptureComplete = (result: { url: string }) => {
    console.log('Capture completed:', result.url);
  };

  const handleError = (error: { message: string }) => {
    console.error('Error:', error.message);
  };

  return (
    <View style={styles.container}>
      <ObjectCaptureView
        ref={objectCaptureViewRef}
        style={styles.container}
        onSessionStateChange={handleSessionStateChange}
        onCaptureComplete={handleCaptureComplete}
        onError={handleError}
      />
      
      {/* Add your UI controls here */}
    </View>
  );
}
```

### CloudPointView

Displays a real-time point cloud visualization of the captured object. This component is useful for providing visual feedback during the capture process.

#### Props

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `ref` | RefObject<ObjectCapturePointCloudViewRef> | No | Ref object to access view methods |
| `containerStyle` | ViewStyle | No | Style object for the cloud point view container |
| `onAppear` | () => void | No | Callback fired when the view appears |
| `onCloudPointViewAppear` | () => void | No | Callback fired when the cloud point visualization appears |
| `ObjectCaptureEmptyComponent` | ComponentType | No | Component to render when no point cloud data is available |
| `ObjectCaptureLoadingComponent` | ComponentType | No | Component to render while point cloud data is loading |


```jsx
import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  ObjectCapturePointCloudView,
  type ObjectCapturePointCloudViewRef,
} from 'react-native-object-capture';

export default function CloudPointViewScreen() {
  const pointCloudViewRef = useRef<ObjectCapturePointCloudViewRef>(null);

  const handleAppear = () => {
    // Handle view appear event
  };

  const handleCloudPointViewAppear = () => {
    // Handle cloud point view appear event
  };

  return (
    <ObjectCapturePointCloudView
      ref={pointCloudViewRef}
      style={styles.container}
      onAppear={handleAppear}
      onCloudPointViewAppear={handleCloudPointViewAppear}
      ObjectCaptureEmptyComponent={EmptyComponent}
      ObjectCaptureLoadingComponent={LoadingComponent}
    />
  );
}
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

##### ReconstructionConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `inputPath` | string | Yes | Directory containing input images |
| `outputPath` | string | Yes | Path where the USDZ model will be saved |
| `checkpointPath` | string | Yes | Directory for saving reconstruction checkpoints |


```jsx
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import PhotogrammetrySession from 'react-native-object-capture';

export default function PhotogrammetryScreen() {
  const handleStartReconstruction = async () => {
    try {
      await PhotogrammetrySession.startReconstruction({
        inputPath: 'Images/',
        checkpointPath: 'Snapshots/',
        outputPath: 'Reconstruction/model.usdz',
      });
    } catch (error) {
      console.error('Reconstruction failed:', error);
    }
  };

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