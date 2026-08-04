# react-native-object-capture

[![npm version](https://img.shields.io/npm/v/react-native-object-capture)](https://www.npmjs.com/package/react-native-object-capture)
[![npm downloads](https://img.shields.io/npm/dm/react-native-object-capture)](https://www.npmjs.com/package/react-native-object-capture)
[![CI](https://github.com/tristanheilman/react-native-object-capture/actions/workflows/ci.yml/badge.svg)](https://github.com/tristanheilman/react-native-object-capture/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-object-capture)](./LICENSE)
[![platform - iOS](https://img.shields.io/badge/platform-iOS-lightgrey)](https://developer.apple.com/documentation/realitykit/objectcapturesession)

A React Native wrapper around Apple's [Object Capture](https://developer.apple.com/documentation/realitykit/objectcapturesession)
and [PhotogrammetrySession](https://developer.apple.com/documentation/realitykit/photogrammetrysession):
guided 3D scanning of a real object, on-device reconstruction to USDZ, and the object's
real-world dimensions in metres.

Built for the New Architecture (Fabric component views and TurboModules).

## Status

Pre-1.0 and moving. The capture → reconstruction → dimensioned-model flow has been run end to
end on a physical device (iPhone 16 Pro Max, iOS 26), and the example app builds green on iOS and
Android in CI, but coverage across devices and iOS versions is thin and the API may still change
between minor versions. Pin an exact version if that matters to you.

Bug reports with a device model and iOS version are the most useful thing you can contribute.
See [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's planned.

## Requirements

- iOS 17.0 or later
- iPhone 12 Pro or newer (LiDAR)
- React Native 0.79 or later with the New Architecture (Fabric / TurboModules) enabled

**iOS only.** Object Capture is an Apple framework with no Android equivalent — the Android
module is a stub that rejects with `NOT_IMPLEMENTED`. See the roadmap for where that stands.

## Installation

```sh
npm install react-native-object-capture
# or
yarn add react-native-object-capture
```

```sh
cd ios && pod install
```

Add the following to your `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to capture 3D objects</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to save captured 3D objects</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app needs photo library access to save captured 3D objects</string>
```

## Quick start

Render the capture view, drive the session with the `ObjectCaptureSession` module, then hand the
captured images to `PhotogrammetrySession`.

```tsx
import { useEffect, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import {
  ObjectCaptureView,
  ObjectCaptureSession,
  PhotogrammetrySession,
  type SessionState,
} from 'react-native-object-capture';

export default function Scan() {
  const [state, setState] = useState<SessionState>('initializing');

  useEffect(() => {
    PhotogrammetrySession.addDimensionsListener(({ width, height, depth }) => {
      console.log(`${width}m x ${depth}m x ${height}m`);
    });
    PhotogrammetrySession.addCompleteListener(() => console.log('done'));
    return () => PhotogrammetrySession.removeAllListeners();
  }, []);

  const startCapture = async () => {
    await ObjectCaptureSession.startDetection();
    await ObjectCaptureSession.startCapturing();
  };

  // Call this once the user has completed their scan passes — three is the
  // recommended number, tracked via onScanPassCompleted.
  const reconstruct = async () => {
    await ObjectCaptureSession.finishSession();
    await PhotogrammetrySession.startReconstruction({
      imagesDirectory: 'Images/',
      checkpointDirectory: 'Snapshots/',
      outputPath: 'Reconstruction/model.usdz',
    });
  };

  return (
    <View style={styles.container}>
      <ObjectCaptureView
        style={styles.container}
        checkpointDirectory="Snapshots/"
        imagesDirectory="Images/"
        onSessionStateChange={(e) => setState(e.nativeEvent.state)}
        onError={(e) => console.error(e.nativeEvent.error)}
      />
      {state === 'ready' ? (
        <Button title="Start capturing" onPress={startCapture} />
      ) : (
        <Button title="Finish and reconstruct" onPress={reconstruct} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
```

A complete flow — capture, scan-pass review, reconstruction with progress, and model preview —
is in [`example/`](example/).

## Components

### ObjectCaptureView

The guided capture UI. Renders Apple's camera interface with real-time feedback and drives the
session lifecycle.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `style` | ViewStyle | Yes | Style object for the view container |
| `checkpointDirectory` | String | Yes | Directory to use for the object capture session |
| `imagesDirectory` | String | Yes | Directory to save image captures to during the session |
| `overCaptureEnabled` | Boolean | No | When `true`, captures extra images beyond the guided passes so the same folder can later be reprocessed at higher detail on macOS (maps to `ObjectCaptureSession.Configuration.isOverCaptureEnabled`). Defaults to `false` |
| `ref` | RefObject&lt;ObjectCaptureViewRef&gt; | No | Ref exposing the session methods. Prefer the `ObjectCaptureSession` module — see below |
| `onSessionStateChange` | (evt: `NativeSyntheticEvent<SessionStateChange>`) => void | No | Fired when the capture session state changes |
| `onTrackingStateChange` | (evt: `NativeSyntheticEvent<TrackingStateChange>`) => void | No | Fired when the tracking state changes |
| `onFeedbackStateChange` | (evt: `NativeSyntheticEvent<FeedbackStateChange>`) => void | No | Fired when the feedback state changes |
| `onScanPassCompleted` | (evt: `NativeSyntheticEvent<ScanPassCompleted>`) => void | No | Fired when a scan pass completes. Three passes are recommended before finishing the session |
| `onCaptureComplete` | (evt: `NativeSyntheticEvent<CaptureComplete>`) => void | No | Fired when object capture is complete |
| `onError` | (evt: `NativeSyntheticEvent<SessionError>`) => void | No | Fired when an error occurs during capture |

### ObjectCaptureSession

Imperative control over the capture session. The native session is a singleton, so these are
module-level calls rather than methods scoped to a view instance:

```tsx
import { ObjectCaptureSession } from 'react-native-object-capture';

await ObjectCaptureSession.startDetection();
const state = await ObjectCaptureSession.getSessionState();
```

Every method returns a promise, and rejects with a clear message on platforms where the native
module is unavailable rather than failing with `undefined is not a function`.

| Method | Description |
|--------|-------------|
| `resumeSession` | Resumes a paused session |
| `pauseSession` | Pauses a session |
| `startDetection` | Begins detecting objects in the current view |
| `resetDetection` | Resets any detected objects |
| `startCapturing` | Transitions the session from `detecting` to `capturing` |
| `beginNewScan` | Begins a new scan pass |
| `beginNewScanAfterFlip` | Begins a new pass capturing a different orientation, for flippable objects |
| `finishSession` | Ends the capture session and finalises the images so they can be handed to a `PhotogrammetrySession`. Call once all scan passes are complete |
| `cancelSession` | Tears down the session — call this when cleaning up |
| `isDeviceSupported` | Whether the device supports AR and LiDAR |
| `getSessionState` | The current `SessionState` |
| `getTrackingState` | The current `TrackingState` |
| `getFeedbackState` | The current `FeedbackState[]` |
| `getNumberOfShotsTaken` | Number of images taken in the current session |
| `getUserCompletedScanState` | Whether the current scan pass is complete |
| `getNumberOfScanPassUpdates` | Number of completed scan passes |

The same methods are available on the `ObjectCaptureView` ref as thin delegates, kept for
backwards compatibility. That ref may be deprecated in a future release.

### ObjectCapturePointCloudView

A live point-cloud visualisation of the captured object, useful between scan passes to show what
has been captured so far.

#### Props

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `style` | ViewStyle | Yes | Style object for the container. **Height and width must be set** for the view to render |
| `checkpointDirectory` | String | Yes | Directory used for the object capture session |
| `imagesDirectory` | String | Yes | Directory used to save image captures during the session |
| `ref` | RefObject&lt;ObjectCapturePointCloudViewRef&gt; | No | Ref object to access view methods |
| `onAppear` | () => void | No | Fired when the view appears |
| `onCloudPointViewAppear` | () => void | No | Fired when the point cloud visualisation appears |
| `ObjectCaptureEmptyComponent` | ComponentType | No | Rendered when no point cloud data is available |
| `ObjectCaptureLoadingComponent` | ComponentType | No | Rendered while point cloud data is loading |

```tsx
import { useWindowDimensions } from 'react-native';
import { ObjectCapturePointCloudView } from 'react-native-object-capture';

const { width, height } = useWindowDimensions();

<ObjectCapturePointCloudView
  checkpointDirectory="Snapshots/"
  imagesDirectory="Images/"
  style={{ width, height: height / 2 }}
  ObjectCaptureEmptyComponent={EmptyState}
  ObjectCaptureLoadingComponent={Spinner}
/>;
```

### QuickLookView

Previews a model file in a `QLPreviewController`.

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | String | Yes | Path to the model file |
| `style` | ViewStyle | Yes | Style object for the container |

```tsx
import { QuickLookView } from 'react-native-object-capture';

<QuickLookView path={path} style={{ width: '100%', height: '100%' }} />;
```

### PhotogrammetrySession

Turns the captured images into a 3D model, reporting progress and the object's real-world size.

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `startReconstruction` | (options: PhotogrammetrySessionOptions) => Promise&lt;boolean&gt; | Starts reconstruction |
| `cancelReconstruction` | () => Promise&lt;boolean&gt; | Cancels an ongoing reconstruction |
| `listDirectoryContents` | (directory: string) => Promise&lt;PhotogrammetryDirectoryContents&gt; | Lists files in a directory relative to the app's documents directory |
| `removeAllListeners` | () => void | Removes every listener added below |

##### `PhotogrammetrySessionOptions`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `imagesDirectory` | String | Yes | Directory containing the captured images, relative to the documents directory |
| `checkpointDirectory` | String | Yes | Directory used for reconstruction checkpoints |
| `outputPath` | String | Yes | Where to write the model, relative to the documents directory. Accepts a bare filename (`'model.usdz'`) or any nesting depth (`'Outputs/chair/model.usdz'`). Must include a file extension |
| `detail` | `'reduced'` | No | Reconstruction quality. On iOS, `'reduced'` is the only level `PhotogrammetrySession.Request.Detail` exposes — `preview`/`medium`/`full`/`raw` are macOS only. Omit to use the framework default; an unsupported level rejects with `DETAIL_ERROR` |

#### Event listeners

| Listener | Callback | Description |
|----------|----------|-------------|
| `addProgressListener` | (progress: number) => void | Reconstruction progress updates |
| `addDimensionsListener` | (dimensions: PhotogrammetryDimensions) => void | Fired once per reconstruction with the object's real-world size in **metres** |
| `addCompleteListener` | () => void | Reconstruction completed successfully |
| `addErrorListener` | (error: string) => void | An error occurred during reconstruction |
| `addCancelledListener` | () => void | Reconstruction was cancelled |
| `addRequestCompleteListener` | () => void | A request completed |
| `addInputCompleteListener` | () => void | Input processing completed |
| `addInvalidSampleListener` | ({ id, reason }) => void | A sample was invalid |
| `addSkippedSampleListener` | ({ id }) => void | A sample was skipped |
| `addAutomaticDownsamplingListener` | () => void | Automatic downsampling occurred |
| `addProcessingCancelledListener` | () => void | Processing was cancelled |
| `addUnknownOutputListener` | () => void | The output type was unknown |

#### Dimensions

Every reconstruction requests the object's bounding box alongside the model, so you get the
subject's real-world size without any extra work. All values are in **metres**, and
`addDimensionsListener` fires when the bounds request completes — typically *before* the
complete listener.

```ts
type PhotogrammetryDimensions = {
  width: number;   // extent along X
  height: number;  // extent along Y
  depth: number;   // extent along Z
  center: { x: number; y: number; z: number };
};
```

```tsx
PhotogrammetrySession.addDimensionsListener(({ width, height, depth }) => {
  console.log(
    `${(width * 100).toFixed(1)} x ${(depth * 100).toFixed(1)} x ${(height * 100).toFixed(1)} cm`
  );
});
```

## States

`SessionState` — emitted by `onSessionStateChange`:

`initializing` · `ready` · `detecting` · `capturing` · `processing` · `completed` · `failed`

`TrackingState` — emitted by `onTrackingStateChange`:

| State | Meaning |
|-------|---------|
| `notAvailable` | Tracking is unavailable |
| `limited` | Tracking is degraded by current conditions |
| `normal` | Tracking is unobstructed |

`FeedbackState[]` — emitted by `onFeedbackStateChange`. Surface these to the user during capture;
they are how Object Capture tells you why a scan is going badly:

| State | Meaning |
|-------|---------|
| `objectTooClose` | The object is too close to the camera |
| `objectTooFar` | The object is too far from the camera |
| `movingTooFast` | The camera is panning too quickly to capture accurately |
| `environmentLowLight` | Lighting is too low for accurate capture |
| `environmentTooDark` | Lighting is too low to capture at all |
| `outOfFieldOfView` | The object has left the camera's field of view |
| `objectNotFlippable` | The detected object is not flippable |
| `overCapturing` | The current scan pass has captured more than it needs |
| `objectNotDetected` | The session cannot find the object |

## What scans well

Object Capture is Apple's framework, and its limits are Apple's, not this wrapper's. It does well
on rigid, static, matte, textured objects roughly 5cm–2m — something you can walk all the way
around. It degrades or fails on reflective, transparent, deformable, furry or very small
subjects. Reconstruction takes minutes of on-device compute and warms the device.

## Contributing

See the [contributing guide](CONTRIBUTING.md) for the development workflow. Issues, reproductions
and PRs are all welcome.

## License

MIT
