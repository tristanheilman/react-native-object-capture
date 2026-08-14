# Where Android is heading

What Google has actually shipped and announced, and what it implies for the odds of a native
Android answer to Object Capture. Checked 13 August 2026.

## Signal 1: ARCore for phones is maintained, not advanced

The classic ARCore SDK for Android ships on a steady ~two-month cadence:

| Version | Date |
|---|---|
| 1.54.0 | 22 April 2026 |
| 1.53.0 | 10 March 2026 |
| 1.52.0 | 12 December 2025 |
| 1.51.0 | 22 October 2025 |
| 1.50.0 | 11 July 2025 |
| 1.49.0 | 20 May 2025 |

Healthy maintenance. But the capability set has not gained reconstruction, meshing, or object
capture across any of these releases, and the
[open feature request for a RoomPlan-style API](https://github.com/google-ar/arcore-android-sdk/issues/1772)
has gone unanswered. Google's position on phone AR reads as *keep it working*, not *close the gap
with ARKit*.

## Signal 2: the investment moved to headsets and glasses

Android XR stopped being a preview and started shipping through 2025–2026. At Google I/O 2026,
ARCore, Jetpack SceneCore and the XR Jetpack libraries were presented as one framework spanning
the Samsung Galaxy XR headset, Project Aura, Samsung display glasses and future Android XR
hardware.

`androidx.xr.arcore` reached **1.0.0-beta02 on 12 August 2026** — the day before this research —
with perception features moving to beta: depth maps, hand and eye tracking, hit testing, spatial
anchors, plane detection with semantic labels, `AugmentedObject` tracking, QR codes, and an early
preview of Geospatial.

Two things to notice:

- **`AugmentedObject` is object *tracking*, not object *capture*.** It recognises and tracks
  configured object categories in view. It does not produce geometry.
- **Still no mesh reconstruction and no object capture** anywhere in the Jetpack XR perception
  surface. The new API generation launched without the thing that would matter here.

## Signal 3: the phone AR API surface is being unified onto Jetpack XR

The most consequential item for this library's long-term Android question:
[**"Run ARCore for Jetpack XR apps on mobile devices"**](https://developer.android.com/develop/xr/jetpack-xr-sdk/arcore/mobile).

> *"Running ARCore for Jetpack XR apps on mobile devices is currently in developer preview. Some
> features may be missing or may not work as expected."*

Phones run the Jetpack XR perception APIs through the Google Play Services for AR runtime.
Locally-persistent anchors, face tracking and eye tracking are unsupported there. Reaching the
classic ARCore `Session`/`Frame` for anything not yet exposed requires opting into
`UnsupportedArCoreCompatApi`, which is *"exposed for compatibility reasons, and will be removed in
a future release."*

Read plainly: **Jetpack XR is the intended future front door for AR on Android, phones included,
and the classic ARCore SDK is on a long glide path.** Anything built against `com.google.ar:core`
today should expect a migration. That is a real, dated cost to attach to any Android
implementation — not a hypothetical one.

## Signal 4: the industry moved to Gaussian splats

Niantic open-sourced **SPZ** (~90% smaller than PLY), Scaniverse produces splats on device on
Android, Luma is splat-first, and KIRI added 3DGS with a to-mesh step. Splats have become the
default representation for consumer capture.

This cuts both ways. Splats are cheaper to produce and render beautifully — but they are not
meshes. Everything downstream of this library's current contract (USDZ, metric bounding box,
QuickLook / Scene Viewer, 3D printing, CAD, e-commerce viewers) assumes geometry. A splat-based
Android path would not be API parity; it would be a second, different product.

## Signal 5: hardware is not coming back

Covered in [`PLATFORM_CAPABILITIES.md`](PLATFORM_CAPABILITIES.md) — every ToF-equipped Android
phone on Google's supported-device list is a 2019 or 2020 model, LG has exited phones, and Samsung
has not shipped a depth sensor since the S20 generation. Google's strategic answer is software
depth-from-motion at **88%+ device coverage**, which is the opposite bet from Apple's.

No signal of an Android LiDAR tier exists. Plan for RGB plus estimated depth indefinitely.

## What would have to change

Concrete triggers that would make revisiting this worthwhile, in rough order of likelihood:

1. **Google ships a reconstruction or scene-meshing API** in ARCore or Jetpack XR — the direct
   unblock. Nothing in DP4 or the beta suggests it is coming.
2. **A vendor ships a genuine on-device Android object-reconstruction SDK** with public licensing.
   Niantic is closest; their product focus is spaces.
3. **An OEM reintroduces a depth-sensor tier** with enough share to target. No signal.
4. **Android XR handset convergence completes** and the perception APIs pick up meshing on the way.
   Worth re-checking each I/O.

Until one of those lands, an Android implementation means building a capture UI and paying for
reconstruction — see [`RECOMMENDATION.md`](RECOMMENDATION.md).

## Sources

- [ARCore SDK releases](https://github.com/google-ar/arcore-android-sdk/releases)
- [ARCore for Jetpack XR release notes](https://developer.android.com/jetpack/androidx/releases/xr-arcore)
- [Run ARCore for Jetpack XR apps on mobile devices](https://developer.android.com/develop/xr/jetpack-xr-sdk/arcore/mobile)
- [Android XR SDK Developer Preview 4](https://android-developers.googleblog.com/2026/05/android-xr-sdk-developer-preview-4-updates.html)
- [17 things for Android developers at I/O 2026](https://android-developers.googleblog.com/2026/05/17-things-android-developers-google-io.html)
- [ARCore supported devices](https://developers.google.com/ar/devices)
