# Example app

A full walkthrough of `react-native-object-capture`: scan an object, review each pass, reconstruct
it into a USDZ model, and preview the result.

## Screens

| Screen | What it shows |
|--------|---------------|
| `HomeScreen` | Device support check and permissions |
| `ObjectSessionScreen` | `ObjectCaptureView` driving a live capture session |
| `ScanPassStageModal` | `ObjectCapturePointCloudView` between scan passes, with flip / continue / finish |
| `PhotogrammetrySessionScreen` | Reconstruction with progress and real-world dimensions |
| `ModelOutputListScreen` | Completed models on disk |
| `ModelOutputScreen` | `QuickLookView` preview of a model |

## Running it

**A physical device is required.** Object Capture needs LiDAR — iPhone 12 Pro or newer, iOS 17 or
later. The app will launch in the simulator, but a capture session won't start.

From the repository root:

```sh
yarn                 # install dependencies for the library and the example
yarn example start   # start Metro
yarn example ios     # build and run on a connected device
```

For iOS you'll need CocoaPods dependencies installed:

```sh
cd example/ios && pod install
```

The example consumes the library from source, so JavaScript changes hot-reload. Native changes
need a rebuild.

New to React Native? Start with [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment).
