# Roadmap

Where `react-native-object-capture` stands and what's planned next. Items here are intentions,
not commitments — the ordering may change.

**Status:** the New Architecture migration has landed, the example app runs on
`react-native@0.83.10`, and the capture → reconstruction → dimensioned-model flow has been
verified on a physical device (iPhone 16 Pro Max, iOS 26). The library is still pre-1.0 and the
API may change.

---

## Shipped

### Correctness and capability

- **`outputPath` resolution** — nested paths and flat filenames both write where you'd expect.
- **`PhotogrammetrySession.Request.detail`** — exposed on the JS side. Only `reduced` is
  available on iOS; `preview`/`medium`/`full`/`raw` are macOS-only, so the JS type is
  `'reduced'`.
- **Real-world dimensions** — `.bounds` is included in the request list and the bounding box is
  bridged through, so JS receives `{width, height, depth, center}` in metres via `onDimensions`.
- **`overCaptureEnabled`** — captures extra images beyond the guided passes so the same folder
  can be reprocessed at higher detail on macOS.

### New Architecture (Fabric / TurboModules)

Required to work on any current React Native: 0.82 removed the legacy opt-out and 0.83 removed
the legacy code. The interop layer isn't a way out — view commands and event emitters are
[precisely the cases it handles incorrectly](https://github.com/reactwg/react-native-new-architecture/discussions/266),
and this library depends on both.

- Codegen specs for all three views (`src/specs/*NativeComponent.ts`) and both modules
  (`src/specs/Native*.ts`).
- The imperative session methods moved off the view onto an `RNObjectCaptureSession` module.
  They previously took a react tag that was never read — every native method body operated on a
  shared session manager. Modelling them as a module removes `findNodeHandle` and lets them keep
  returning promises, which view commands cannot. **The ref APIs are preserved as thin
  delegates, so this was not a breaking change.**
- `RCTViewComponentView` subclasses for the three views, with the SwiftUI hosting controllers
  reparented onto them; component descriptors registered via `codegenConfig.ios.componentProvider`.
- TurboModule conformance for `RNObjectCaptureSession`, `RNPhotogrammetrySession` and
  `RNObjectCapture`.
- Podspec no longer hard-depends on `React-Codegen` (renamed to `ReactCodegen` in RN 0.75), which
  would fail to resolve on any current version.

How the native layer fits together is documented in [`IOS_ARCHITECTURE.md`](IOS_ARCHITECTURE.md).

---

## Planned

- **`RoomPlanView`** — a wrapper around RoomPlan, the other half of what a React Native spatial
  library is usually wanted for.
- **Scan catalog** — persistence, metadata and thumbnails for completed scans. Today there's only
  `listDirectoryContents`.
- **Android story.** Researched in depth — see [`docs/android/`](android/README.md). There is no
  Android equivalent to Object Capture and none announced: no reconstruction API at any level, no
  current device with a depth sensor, and Google's AR investment has moved to headsets and glasses.
  The recommendation is **no native Android parity**; delete the stubs that imply a roadmap that
  doesn't exist, make the degradation honest, and revisit only on a
  [specific trigger](android/ROADMAP_SIGNALS.md#what-would-have-to-change).

---

## Known limitations

- **iOS only.** The Android module is a stub: photogrammetry rejects with `NOT_IMPLEMENTED` and
  the view manager returns a bare `View`.
- **Hardware floor is iPhone 12 Pro or newer** (LiDAR), iOS 17+.
- Object Capture works well on rigid, static, matte, textured objects roughly 5cm–2m. It degrades
  badly on reflective, transparent, deformable or very small subjects — that's a constraint of
  Apple's API, not of this wrapper.
- Reconstruction takes minutes of on-device compute per object and warms the device.
- Device testing has been limited to a small number of devices and scenarios. Bug reports with
  device and iOS version are welcome.
