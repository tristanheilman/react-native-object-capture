# What this repo ships on Android today

Audited 13 August 2026, and cleaned up the same day — the audit findings and what was done about
them are both recorded here.

## Today, after cleanup

```
android/src/main/AndroidManifest.xml                  empty <manifest>, no permissions
android/build.gradle                                  com.android.library, codegen wired to ../src
android/src/main/java/com/objectcapture/
  RNObjectCapturePackage.kt                           registers the module below, no view managers
  PhotogrammetrySessionModule.kt                      codegen spec impl, all three methods reject
```

One module, three methods, each rejecting with `NOT_IMPLEMENTED`. That is the whole Android
surface, and it is deliberately the whole Android surface.

`android/build.gradle` points codegen at `../src`, so Android generates specs from the same
`src/specs/*.ts` the iOS side uses. The example app builds green on Android in CI
(`.github/workflows/ci.yml`, `build-android`), verified locally after the cleanup.

## How each API degrades

| Public API | Android behaviour |
|---|---|
| `ObjectCaptureSession` (15 methods) | Rejects: *"RNObjectCaptureSession native module is not available. Object Capture requires iOS 17 or later on a device with LiDAR."* |
| `ObjectCaptureSession.isDeviceSupported()` | Resolves `false` — the capability gate, which must not throw |
| `PhotogrammetrySession` (3 methods) | Rejects with `NOT_IMPLEMENTED` from the native module |
| `PhotogrammetrySession` (12 listeners) | Register successfully, never fire — the calls that would produce events reject first |
| `ObjectCaptureView` / `PointCloudView` / `QuickLookView` | `console.warn`, render `null` |
| `ObjectCaptureConstants` | `undefined` — as it is on iOS too |

Nothing crashes, nothing silently pretends to work, and every failure names the reason.

---

## What the audit found

Recorded because it is the evidence behind [`RECOMMENDATION.md`](RECOMMENDATION.md), not just
changelog.

### Two view managers were unreachable dead code

`RNObjectCaptureViewManager.kt` and `RNObjectCapturePointCloudViewManager.kt` returned a bare
`android.view.View` and were registered in the package — but every public view component returns
`null` before it ever renders the native component:

- `src/components/RNObjectCaptureView.tsx:109` — `if (Platform.OS !== 'ios') { console.warn(…); return null }`
- `src/components/RNObjectCapturePointCloudView.tsx:84` — same
- `src/components/RNQuickLookView.tsx:15` — same

No code path could reach either manager. Their `@ReactProp` setters were also wrong in shape,
declaring event props (`onSessionStateChange` and friends) as `Boolean`, which is not how events
work on either architecture. There was no `RNQuickLookView` manager at all, so the set was not even
internally consistent. **Deleted.**

### `RNObjectCaptureModule` held a name and nothing else

No methods, no constants — it existed so `NativeModules.RNObjectCapture` would resolve to
*something*. It mirrored the iOS `RNObjectCapture` module, which `src/NativeObjectCapture.ts`
already documents at length as inert. **Deleted**, and `src/NativeObjectCapture.ts` now types the
module as possibly `undefined` with `src/index.ts` guarding the `.constants` read, so importing the
package on Android cannot throw.

### The photogrammetry emitter was noisy, not broken

Worth stating precisely, because the first pass of this document overstated it.

`src/modules/PhotogrammetrySession.ts` builds a module-level `NativeEventEmitter` at **import
time**. The Android module exists but implements only the three reconstruction methods, not the
`addListener`/`removeListeners` bookkeeping the emitter expects. Reading RN's
`NativeEventEmitter` source, that combination produces:

- **two `console.warn` calls on every import** on Android (one for each missing method), and
- listeners that register against `RCTDeviceEventEmitter` and never fire — `addListener` uses
  optional chaining (`this._nativeModule?.addListener(...)`), so there is no throw.

So it was import-time log noise plus dead listeners, **not a crash and not an obscure failure**.
Fixed by passing the module to the emitter only on iOS: same dead emitter off iOS, without the
warnings. The three methods also route through a `requireModule()` guard now, matching the pattern
`src/modules/ObjectCaptureSession.ts` already used.

### The manifest declares nothing

`AndroidManifest.xml` is an empty `<manifest>` element — no `CAMERA` permission, no
`com.google.ar.core` metadata, no `uses-feature`. Correct for a stub, and the first thing that
would change for any real implementation.

## Configuration

`android/gradle.properties`:

```
minSdkVersion=24    targetSdkVersion=34    compileSdkVersion=35
kotlinVersion=2.0.21    ndkVersion=27.1.12297006
```

`minSdk 24` matches the ARCore floor (Android 7.0), which is convenient but coincidental — nothing
here depends on ARCore and there is no `com.google.ar:core` dependency.

These are **fallback defaults, not values imposed on consumers**. `android/build.gradle` reads them
through `getExtOrIntegerDefault`, which prefers `rootProject.ext` and only falls back to
`gradle.properties`. Any React Native app from a current template defines `ext.targetSdkVersion` at
the root, so the library compiles against the app's value — the example app here builds this module
at 36, not 34.

So `targetSdkVersion 34` is worth refreshing for tidiness and for anyone consuming the module
without root ext values, but it does not hold an app back from the Play Store's requirement for
new submissions. **Still outstanding, low priority.**
