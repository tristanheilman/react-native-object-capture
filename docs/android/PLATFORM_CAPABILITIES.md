# What Android provides today

Verified against Google's documentation on 13 August 2026.

## The shape of the gap

Apple's Object Capture is two separable products behind one API:

1. **Guided capture** — `ObjectCaptureSession` runs an AR session, detects the object, tracks
   which parts of it you have covered, and emits feedback (`objectTooClose`, `movingTooFast`,
   `environmentLowLight`, …) until a scan pass is complete.
2. **Reconstruction** — `PhotogrammetrySession` takes that image folder and produces a textured,
   metrically scaled USDZ, on device.

Android has **no API for either one, at any level, from Google or from the OEMs.** The question is
not "which Android API do we wrap" — there is none. It is "what could be built from the primitives,
and at what cost".

## ARCore: what you get

[ARCore](https://developers.google.com/ar) is actively maintained — the SDK has shipped roughly
every two months through 2026 (`v1.54.0`, 22 April 2026; `v1.53.0`, 10 March 2026; `v1.52.0`,
12 December 2025). It is not abandonware. It just doesn't do reconstruction.

Useful primitives for a capture experience:

| ARCore feature | What it gives you | Maps to |
|---|---|---|
| Motion tracking / camera pose | 6-DoF pose per frame | Knowing where each photo was taken — the input every photogrammetry pipeline wants |
| `TrackingState` + failure reasons | `TRACKING`/`PAUSED` with `INSUFFICIENT_LIGHT`, `EXCESSIVE_MOTION`, `INSUFFICIENT_FEATURES` | Roughly `TrackingState` and part of `FeedbackState` |
| [Depth API](https://developers.google.com/ar/develop/depth) | Per-pixel depth map, every pixel, smoothed | Distance-to-object checks (`objectTooClose`, `objectTooFar`) |
| [Raw Depth API](https://developers.google.com/ar/develop/java/depth/raw-depth) | Higher-accuracy depth, sparse — not every pixel has an estimate | A live point cloud preview |
| Plane detection with semantic labels | Floors, walls, tabletops | Placing a bounding box around the subject |
| Lighting estimation | Ambient intensity | `environmentLowLight` / `environmentTooDark` |
| Augmented Images, Geospatial, Cloud Anchors | Marker tracking, world-anchored content | Not relevant here |

**Depth API reach: "over 88% of active devices" as of May 2026**, per Google's
[supported devices page](https://developers.google.com/ar/devices). It does not require a hardware
depth sensor — it runs a depth-from-motion algorithm and uses hardware sensors only when present.

Its documented limits matter for capture guidance:

- Depth requires device motion. *"Valid depth data are only available after the user has started moving."*
- Accurate at **0.5–5 m**. Apple's Object Capture targets objects roughly 5 cm–2 m; the small end
  of that range sits at or below ARCore's near limit.
- *"Surfaces with few or no features, such as white walls, will be associated with imprecise depth."*

### Shared camera access — the primitive that makes capture-only viable

[Shared camera access](https://developers.google.com/ar/develop/java/camera-sharing) is the piece
that turns ARCore from "an AR display API" into something usable for capture. It lets an app
*"switch seamlessly between exclusive control of the camera via the Android Camera2 API and sharing
camera access with ARCore"* — so you can hold ARCore's motion tracking while pulling
full-resolution stills through Camera2.

That is exactly the input a photogrammetry pipeline wants: high-res JPEGs **plus a known 6-DoF pose
for each one**. Pose-tagged images are what would let a backend recover metric scale, which
otherwise is the hardest gap in the parity story.

The caveats are device-tier dependent, and they matter:

- ARCore takes two streams by default (1× YUV CPU for motion tracking, 1× GPU). Your capture
  surface is on top of that.
- Google's stated budget for **high-end phones** is *"2x YUV CPU streams, 1x GPU stream, 1x
  occasional high res still image (JPEG), e.g. 12MP"*. Mid-tier phones support fewer simultaneous
  streams, so a concurrent high-res still may simply not be available.
- *"Requesting additional custom surfaces increases the performance demands of the device. To
  ensure it performs well, test your app on the devices that your users will use."*
- Entering non-AR mode requires pausing ARCore, so mode transitions have to be managed explicitly.

Note the word "occasional" in Google's own stream budget. This supports a *deliberate* capture
cadence — shoot a frame every so often as the user orbits the object — not a continuous
high-resolution burst. Workable, but another place where the wide Android device population, with
no depth-sensor floor to anchor it, sets the ceiling.

### What ARCore does not provide

Confirmed against the current docs: mesh
reconstruction, scene meshing, object scanning, or 3D model export. There is no ARKit
`ARMeshAnchor` equivalent, and the long-standing
[feature request for a RoomPlan-style API](https://github.com/google-ar/arcore-android-sdk/issues/1772)
remains open and unanswered.

> One historical footnote: ARCore *did* once have an object-scanning tool — `arcore_scanner_app`,
> which produced `.imgdb` files for Augmented Images. That is **2D image recognition**, not 3D
> capture, and shares nothing with Object Capture beyond the word "scan".

## Hardware: the quiet killer

This library targets iPhone 12 Pro and later because Object Capture requires LiDAR. There is no
equivalent Android tier to target.

Google's supported-devices list flags exactly these phones as having a hardware depth sensor:

| Device | Released |
|---|---|
| Samsung Galaxy S10 5G | 2019 |
| Samsung Galaxy Note10+ / Note10+ 5G | 2019 |
| Samsung Galaxy A80 | 2019 |
| Samsung Galaxy S20+ / S20 Ultra 5G | 2020 |
| LG V60 ThinQ / V60 ThinQ 5G | 2020 |

Every one is a 2019 or 2020 device. LG left the phone business in 2021. Samsung dropped ToF after
the S20 generation and has not brought it back. **No current Android flagship ships a depth
sensor**, and Google's own answer to that has been software depth-from-motion, not hardware.

The consequence: an Android implementation cannot lean on hardware depth the way the iOS side
leans on LiDAR. It must work from RGB plus estimated depth on a wide, unpredictable device
population — a materially harder problem than the one Apple solved on a hardware tier it controls.

## Viewing a finished model

This is the one place Android has a genuine, shipping equivalent.

**[Scene Viewer](https://developers.google.com/ar/develop/scene-viewer)** is the Android analogue
of `QuickLookView`: a system-provided AR model viewer launched by intent, present on ARCore-capable
devices since Android 7.0. No deprecation notice on the page as of this writing.

```
Intent: ACTION_VIEW
data:    https://arvr.google.com/scene-viewer/1.0?file=<https URL to .gltf/.glb>
package: com.google.android.googlequicksearchbox
```

Its constraints are real and would shape any API built on it:

- **glTF 2.0 / GLB only** — not USDZ. Different output format from the iOS side.
- **HTTPS required; local files are not supported.** A model reconstructed on device would have to
  be uploaded somewhere before it could be viewed. This alone breaks a naive `<QuickLookView path={localFile} />`
  parity story.
- 10 MB model size cap, ≤100k triangles (30–50k recommended), ≤10 materials, ≤2048×2048 textures.
- Requires an up-to-date Google app and Google Play Services for AR — i.e. not available on
  devices without Google services.

The alternative is bundling a renderer — [SceneView](https://sceneview.github.io/) (ARCore +
Filament, with a React Native binding) or Filament directly — which removes the HTTPS and size
limits at the cost of app size and a real dependency.

## Summary

| Capability | iOS (this library) | Android today |
|---|---|---|
| Guided capture session | `ObjectCaptureSession` | ✗ — buildable from ARCore primitives |
| Coverage / scan-pass tracking | built in | ✗ — would have to be invented |
| Feedback states | 9 states from Apple | ~4–5 derivable from ARCore |
| Live point cloud preview | `ObjectCapturePointCloudView` | ~ Raw Depth point cloud, different data |
| On-device reconstruction | `PhotogrammetrySession` | ✗ — nothing at any level |
| Metric scale / real dimensions | `.bounds` in metres | ✗ — depends entirely on the backend chosen |
| Model viewer | QuickLook (USDZ) | ✓ Scene Viewer (GLB, HTTPS-hosted, ≤10 MB) |
| Hardware depth tier | LiDAR, iPhone 12 Pro+ | ✗ — last ToF flagship was 2020 |

## Sources

- [ARCore Depth API](https://developers.google.com/ar/develop/depth) · [Raw Depth](https://developers.google.com/ar/develop/java/depth/raw-depth)
- [ARCore supported devices](https://developers.google.com/ar/devices)
- [ARCore SDK releases](https://github.com/google-ar/arcore-android-sdk/releases)
- [Scene Viewer](https://developers.google.com/ar/develop/scene-viewer)
- [RoomPlan-equivalent feature request (open)](https://github.com/google-ar/arcore-android-sdk/issues/1772)
- [SceneView SDK](https://sceneview.github.io/)
