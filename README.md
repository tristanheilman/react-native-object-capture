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

## Usage

```jsx
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ObjectCaptureView,
  type SessionState,
  type ObjectCaptureViewRef,
} from 'react-native-object-capture';

type ObjectSessionScreenProps = {
  navigation: any;
};

export default function ObjectSessionScreen({
  navigation,
}: ObjectSessionScreenProps) {
  const objectCaptureViewRef = useRef<ObjectCaptureViewRef>(null);
  const [sessionState, setSessionState] =
    useState<SessionState>('initializing');

  const handleSessionStateChange = (state: SessionState) => {
    setSessionState(state);
  };

  const handleCaptureComplete = (result: { url: string }) => {
    console.log('Capture completed:', result.url);
  };

  const handleError = (error: { message: string }) => {
    console.error('Error:', error.message);
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

  const handleFinishSession = async () => {
    await objectCaptureViewRef.current?.finishSession();
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
        onSessionStateChange={handleSessionStateChange}
        onCaptureComplete={handleCaptureComplete}
        onError={handleError}
      />

      <View style={styles.floatingBackButton}>
        <Pressable style={styles.button} onPress={handleCancelSession}>
          <Text>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.floatingContainer}>
        <View style={styles.buttonContainer}>
          {sessionState === 'initializing' && (
            <View style={styles.button}>
              <Text>Initializing...</Text>
            </View>
          )}
          {sessionState === 'ready' && (
            <Pressable style={styles.button} onPress={handleStartDetection}>
              <Text>Start Detection</Text>
            </Pressable>
          )}
          {sessionState === 'detecting' && (
            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={handleResetDetection}>
                <Text>Reset Detection</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={handleStartCapturing}>
                <Text>Start Capturing</Text>
              </Pressable>
            </View>
          )}
          {sessionState === 'capturing' && (
            <View style={styles.buttonRow}>
              <Pressable style={styles.button} onPress={handleResetDetection}>
                <Text>Reset Detection</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={handleFinishSession}>
                <Text>Finish Session</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#CD8987',
    borderRadius: 5,
  },
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: 30,
    paddingTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    padding: 16,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
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