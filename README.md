# react-native-object-capture

> ⚠️ **WARNING: This library is currently in active development and is NOT ready for production use.**
> 
> - The implementation is incomplete and may contain bugs
> - API changes are likely to occur
> - Some features may not work as expected
> - Testing has been limited to specific devices and scenarios
> 
> Use at your own risk and expect breaking changes in future releases.

AR object capture session for React Native using Apple's Object Capture API. This library provides a React Native wrapper for capturing 3D objects using the device's camera.

## Requirements

- iOS 17.0 or later
- iPhone 12 Pro or newer (devices with LiDAR sensor)
- React Native 0.76.0 or later

## Installation

```sh
npm install react-native-object-capture
```

## Components

### ObjectCaptureView

The main component for capturing 3D objects. It provides a camera interface with real-time feedback and controls for the capture process.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `style` | ViewStyle | No | Style object for the camera view container |
| `onSessionStateChange` | (state: SessionState) => void | No | Callback fired when the capture session state changes |
| `onCaptureComplete` | (result: { url: string }) => void | No | Callback fired when object capture is complete, providing URL to the captured 3D model |
| `onError` | (error: { message: string }) => void | No | Callback fired when an error occurs during capture |
| `enableObjectDetection` | boolean | No | Enable/disable automatic object detection. Default: true |
| `objectDetectionThreshold` | number | No | Sensitivity threshold for object detection (0.0 to 1.0). Default: 0.5 |
| `guidanceMode` | 'automatic' \| 'manual' | No | Mode for providing capture guidance. Default: 'automatic' |
| `maxCaptureFrames` | number | No | Maximum number of frames to capture. Default: 250 |

#### SessionState Type

The `SessionState` type represents the current state of the capture session:

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
| style | ViewStyle | No | Style object for the cloud point view container |
| ref | RefObject<ObjectCapturePointCloudViewRef> | No | Ref object to access view methods |
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
    <View style={styles.container}>
      <ObjectCapturePointCloudView
        ref={pointCloudViewRef}
        style={styles.container}
        onAppear={handleAppear}
        onCloudPointViewAppear={handleCloudPointViewAppear}
        ObjectCaptureEmptyComponent={EmptyComponent}
        ObjectCaptureLoadingComponent={LoadingComponent}
      />
    </View>
  );
}
```

### PhotogrammetrySession

Handles the processing of captured images into a 3D model. This component manages the reconstruction process and provides progress updates.

#### Event Listeners

| Event | Description |
|-------|-------------|
| `onProgress(event: { progress: number })` | Fired when reconstruction progress updates |
| `onComplete()` | Fired when reconstruction is successfully completed |
| `onError(event: { error: string })` | Fired when an error occurs during reconstruction |
| `onCancelled()` | Fired when reconstruction is cancelled |
| `onRequestComplete()` | Fired when request is completed |
| `onInputComplete()` | Fired when input processing is completed |
| `onInvalidSample(event: { id: string, reason: string })` | Fired when a sample is invalid |
| `onSkippedSample(event: { id: string })` | Fired when a sample is skipped |
| `onAutomaticDownsampling()` | Fired when automatic downsampling occurs |
| `onProcessingCancelled()` | Fired when processing is cancelled |
| `onUnknownOutput()` | Fired when output type is unknown |

#### Methods

The PhotogrammetrySession provides the following methods:

| Method | Description |
|--------|-------------|
| `startReconstruction(config: ReconstructionConfig)` | Starts the 3D model reconstruction process |
| `cancelReconstruction()` | Cancels an ongoing reconstruction |

##### ReconstructionConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `inputPath` | string | Yes | Directory containing input images |
| `outputPath` | string | Yes | Path where the USDZ model will be saved |
| `checkpointPath` | string | No | Directory for saving reconstruction checkpoints |


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