# Recommendation

**No action on native Android parity. Make the iOS-only position explicit, delete the stubs that
imply otherwise, and gate any future Android work on evidence of demand.**

Reasoning, the alternatives considered, and the concrete next steps follow.

## Parity, surface by surface

What "the same functions exposed to React Native on both sides" would actually require, given
[what Android provides](PLATFORM_CAPABILITIES.md):

| Public API | Android feasibility | Notes |
|---|---|---|
| `ObjectCaptureView` (3 props) | 🟡 Rebuildable | An ARCore camera session with custom guidance UI. Original work, not a wrapper. |
| `onTrackingStateChange` | 🟢 Direct | ARCore `TrackingState` maps cleanly. |
| `onFeedbackStateChange` (9 states) | 🟡 Partial | `movingTooFast`, `environmentLowLight`/`TooDark`, `objectTooClose`/`TooFar` derivable. `objectNotDetected`, `objectNotFlippable`, `overCapturing`, `outOfFieldOfView` require object segmentation Android does not give you. |
| `onScanPassCompleted` / `beginNewScanAfterFlip` | 🔴 Invent | Apple's coverage model is proprietary. Reproducing "you have covered enough of this object from enough angles" is a research problem, not an integration. |
| `ObjectCapturePointCloudView` | 🟡 Different | ARCore Raw Depth yields a point cloud, but of the *scene*, not of the tracked subject. Visually similar, semantically not the same thing. |
| `ObjectCaptureSession` (16 methods) | 🟡 Mostly shape-compatible | Lifecycle methods map onto an ARCore session. `getNumberOfScanPassUpdates` / `getUserCompletedScanState` depend on the coverage model above. |
| `PhotogrammetrySession.startReconstruction` | 🔴 No on-device path | Cloud API or your own GPU server. Changes the function from "compute" to "upload". |
| `onProgress` / `onComplete` / `onError` | 🟢 Mappable | Job polling or webhooks behind the same events. |
| `onDimensions` (metres) | 🔴 Not free | Photogrammetry reconstructs up to an unknown scale. Metric output needs ARCore pose data threaded through capture into the backend, and a backend that accepts it. |
| `QuickLookView` | 🟡 Constrained | Scene Viewer works, but GLB only, **HTTPS-hosted only — no local files**, ≤10 MB. A locally reconstructed model cannot be shown without uploading it first. |
| Output format | 🔴 Divergent | USDZ on iOS; GLB for Scene Viewer. KIRI can emit USDZ, so a single cloud backend could feed both — but a bundled renderer would be needed to view it locally on Android. |

Roughly: **a third maps cleanly, a third needs reinvention, and a third cannot be done on device
at all.**

## What "yes" would cost

Rough bands for a solo maintainer, stated as estimates rather than plans:

- **ARCore capture view with real guidance** — several weeks minimum. Camera session, coverage
  heuristics, feedback derivation, a UI to replace Apple's, and testing across a device population
  with no depth-sensor floor to rely on. The hard part is not the plumbing; it is that Apple's
  guidance quality is the product, and matching it is open-ended.
- **Reconstruction integration** — 1–2 weeks against a REST API like KIRI. Cheap in code, expensive
  in everything else: per-scan cost passed to users, network dependency, images leaving the device,
  a privacy posture the iOS side does not have, and an API key to manage.
- **Ongoing** — a second native platform to keep building, plus a known migration ahead:
  `com.google.ar:core` access from Jetpack XR is already flagged as *"will be removed in a future
  release"* ([`ROADMAP_SIGNALS.md`](ROADMAP_SIGNALS.md)).

Against a library currently at v0.2.5 whose iOS path has been verified on a small number of
devices, and whose roadmap already lists RoomPlan and a scan catalog as unshipped.

## The decisive argument

This library's value is that it is a **thin, faithful wrapper** around a framework Apple maintains.
Users get Apple's capture quality; the maintainer's job is bridging, not computer vision.

An Android implementation inverts that. There is no framework to wrap — the guidance model would
be original work and the reconstruction would be a vendor bill. It would be a different product
with different economics, sharing only a TypeScript surface with the thing that exists today.
Shipping something *named* Object Capture on Android that produced visibly worse results, cost
money per scan, uploaded users' photos, and could not report real-world dimensions would damage
the library more than the missing platform does.

The honest framing: **"iOS-only, because Apple ships something Android does not"** is a defensible
position that costs nothing to hold and stays true until Google changes it. It is not a failure to
be papered over with stubs.

## Alternatives considered

| Option | Verdict |
|---|---|
| **A. Full native parity** — ARCore capture UI + cloud reconstruction | ❌ Reject. Months of work, permanent second platform, per-scan cost, worse output, no metric scale. Wrong bet at v0.2.5. |
| **B. Capture-only on Android** — ARCore session that records images + poses, app handles reconstruction | ⏸️ Defer. The most technically honest subset, and [shared camera access](PLATFORM_CAPABILITIES.md#shared-camera-access--the-primitive-that-makes-capture-only-viable) makes it genuinely viable: full-res stills via Camera2 with an ARCore pose attached to each. Pose-tagged images are also the route to metric scale. Still weeks of capture-guidance work, still leaves users at the hard part, and the high-res-still stream budget is not guaranteed on mid-tier devices. Revisit if issues ask for it. |
| **C. Pluggable reconstruction backend** — platform-agnostic JS interface so an app can supply KIRI, Luma or its own server | ⏸️ Defer, but this is the right shape if Android is ever revisited. Adds value on iOS too (higher detail levels than `reduced`, off-device processing for older hardware), needs no Android native code, and would let Android support arrive as a backend rather than a rewrite. |
| **D. No action; make iOS-only explicit** | ✅ **Recommended.** |

If Android is ever revisited, do it as **C then B**, not as A. A pluggable backend earns its keep
on iOS immediately and de-risks the Android decision; a bespoke Android reimplementation earns
nothing until it is finished.

## Next steps

Small, all within the existing scope, and all things `docs/ROADMAP.md` already committed to
("the current Android stubs … will either be scoped honestly or removed"). Steps 1–5 are **done**;
see [`CURRENT_STATE.md`](CURRENT_STATE.md) for the resulting surface.

1. ✅ **Delete the unreachable code.** `RNObjectCaptureViewManager.kt` and
   `RNObjectCapturePointCloudViewManager.kt` could not be reached — the JS components return `null`
   off iOS before touching them. `RNObjectCaptureModule.kt` held a name and nothing else. All three
   removed along with their registrations.

2. ✅ **Keep `PhotogrammetrySessionModule.kt`.** A native `NOT_IMPLEMENTED` rejection is better than
   a missing module, it keeps the Android build green in CI, and it is three honest methods rather
   than a pretence of a view layer.

   *More aggressive alternative, not taken:* opt out of Android entirely with a root
   `react-native.config.js` setting `platforms.android = null`, removing the Gradle project from
   consumers' builds. Cleaner, but it turns a clear rejection into an absent module.

3. ✅ **Close the `PhotogrammetrySession` gap.** The emitter now receives the native module only on
   iOS, which removes two import-time `console.warn`s on Android, and the three methods route
   through a `requireModule()` guard matching `src/modules/ObjectCaptureSession.ts`. Also guarded
   the `ObjectCaptureConstants` read in `src/index.ts`, which would otherwise have thrown at import
   on Android once the empty module was deleted.

4. ✅ **Expose a capability check.** `ObjectCaptureSession.isDeviceSupported()` is the sanctioned
   gate and now resolves `false` when the native module is absent instead of rejecting — a
   capability check that throws is one every caller has to wrap. Consumers should branch on it
   rather than on `Platform.OS`, since plenty of iOS devices lack LiDAR too.

5. ✅ **Point at this research.** The Android bullet in `docs/ROADMAP.md` and the platform note in
   `README.md` link here, so the question is answered once with evidence rather than re-litigated
   per issue.

6. ⬜ **Set a review trigger, not a review date.** Revisit when one of the events in
   [`ROADMAP_SIGNALS.md`](ROADMAP_SIGNALS.md#what-would-have-to-change) occurs — a Google
   reconstruction API, a public on-device Android SDK, a depth-sensor tier returning, or Android XR
   handset convergence landing meshing. Cheapest check: re-read the ARCore and Jetpack XR release
   notes after each Google I/O.
