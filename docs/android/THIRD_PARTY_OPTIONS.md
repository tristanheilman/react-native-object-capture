# Third-party routes to reconstruction on Android

Since Android has no reconstruction API, anything that works on Android gets its geometry from
somewhere else. This surveys where. Checked 13 August 2026 — **pricing and API shapes move; treat
every figure here as a starting point for your own verification, not a quote.**

## The three families

1. **Cloud REST APIs** — upload images, poll, download a model. Works on any device. Per-scan cost,
   network dependency, and your users' photos leave the device.
2. **Vendor SDKs** — link a third party's capture and/or processing into your app. Better UX
   integration, heavier dependency, commercial terms.
3. **Self-hosted pipelines** — run open-source photogrammetry on your own GPU. No per-scan fee, no
   vendor, but you now operate a service.

There is no fourth family. Nobody ships general on-device object reconstruction on commodity
Android hardware as a library you can link.

---

## Cloud REST APIs

### KIRI Engine API — the most accessible option

The only vendor found offering self-serve, documented, per-scan REST access with no sales call.

- **Base URL:** `https://api.kiriengine.app/api/` — Bearer token auth, production and test modes.
- **Scan types:** Photo Scan (textured, non-reflective objects), Featureless Object Scan
  (smooth/reflective/transparent), 3DGS Scan with a to-mesh step.
- **Input:** images, **20 minimum and 300 maximum** for consistent results.
- **Output:** OBJ, FBX, STL, GLB, GLTF, **USDZ**, PLY, XYZ. USDZ output matters — it means one
  reconstruction backend could feed both platforms' viewers.
- **Pricing:** 1 credit = $1 USD per API call regardless of scan method, 500-credit minimum
  top-up, 10 free credits to evaluate.
- **Async:** webhooks are documented, so no polling loop is required.
- **No mobile SDK** — REST only. That is arguably an advantage here: the integration would live in
  JS, not in Kotlin.

Unverified and worth checking before building on it: whether output carries **real-world scale**.
This library exposes `onDimensions` in metres from Apple's `.bounds`; a photogrammetry pipeline
fed loose JPEGs generally reconstructs up to an unknown scale factor. If KIRI does not return
metric scale, `PhotogrammetryDimensions` has no Android counterpart without ARCore-derived scale
being supplied at capture time.

- [API landing page](https://www.kiriengine.app/api) · [docs](https://docs.kiriengine.app/) · [export formats](https://www.kiriengine.app/features/export-formats)

### Luma AI

Gaussian-splat-first, with an enterprise API for programmatic generation and automated pipelines.
Highest consumer-grade splat quality of the group, but **enterprise pricing is contact-sales** and
splats are a different output category from a textured mesh — they view beautifully and integrate
poorly with anything expecting geometry. Practical for a viewer-only product, awkward as a drop-in
for a USDZ pipeline.

### Polycam

Strong product, 15+ export formats, LiDAR support on capable devices, consumer subscriptions
around $11.99/month. Developer API access is not self-serve in the way KIRI's is. Better
characterised as a competitor app than an integration target.

---

## Vendor SDKs

### Niantic Spatial (NSDK 4.0 / Scaniverse)

The most technically interesting option, and the closest thing to a real Android capture SDK.

- **NSDK 4.0** is a unified SDK spanning Unity, Swift, **Android** and ROS 2, connecting to
  Scaniverse and VPS 2.0.
- Scaniverse on Android generates **Gaussian splats and meshes processed on device** — proof that
  commodity Android hardware can do real reconstruction work locally, with cloud processing
  available for higher quality.
- Exports the open-source **SPZ** splat format (~90% smaller than PLY).

The mismatch: Niantic's product is **spaces**, not objects. Rooms, sites, large areas, visual
positioning. Nothing in their materials describes object-level capture of the 5 cm–2 m subject
this library targets, and the licensing is a partner program rather than a public dependency. Worth
watching; not a parity path.

- [Niantic Spatial Capture](https://www.nianticspatial.com/products/capture) · [Scaniverse](https://dev.scaniverse.com/)

### Epic RealityScan Mobile

Free photogrammetry app on Android and iOS (v1.7 added automatic object masking; desktop
RealityCapture rebranded to RealityScan 2.0 in June 2025). Excellent quality.

**App only — no third-party SDK or integration API was found.** Not usable as a dependency.

---

## Self-hosted open source

The pipeline everyone actually uses: **COLMAP** (structure-from-motion) → **OpenMVS** (dense
reconstruction, meshing, texturing), or **OpenMVG** in place of COLMAP, or **Meshroom/AliceVision**
as an integrated alternative.

- COLMAP is desktop/server software — Windows, Linux, macOS — and wants **CUDA** for dense
  reconstruction. It is not an on-device Android proposition.
- AliceVision's libraries do claim Android among their build targets, but "compiles for Android"
  and "reconstructs a model in reasonable time and thermal budget on a mid-range phone" are very
  different claims. Treat any on-device open-source route as a research project, not an
  integration.

Realistic shape: your own GPU server, an upload endpoint, a job queue. Zero marginal cost per scan,
full control of the data, and an operational burden that dwarfs the client-side code.

- [COLMAP](https://colmap.github.io/) · [awesome-photogrammetry](https://github.com/awesome-photogrammetry/awesome-photogrammetry)

---

## The React Native ecosystem

For context on what a consumer would otherwise reach for:

- **[SceneView](https://sceneview.github.io/) / `@sceneview/react-native-sceneform`** — ARCore +
  Filament rendering for React Native. Renders and places 3D content; does not capture or
  reconstruct. Complementary to this library, not competitive.
- Various `react-native-ar*` packages on npm are small, stale, or wrappers around AR display.
- **No React Native library was found that performs 3D object capture on Android.** The gap this
  research is investigating is a gap in the whole ecosystem, not just in this repo.

---

## Comparison

| Option | Where it runs | Object-level | Metric scale | Cost model | Usable as a dependency |
|---|---|---|---|---|---|
| KIRI Engine API | Cloud | ✅ | ❓ verify | ~$1/scan, $500 min | ✅ REST, self-serve |
| Luma AI | Cloud | ✅ splats | ❓ | Contact sales | ⚠️ enterprise only |
| Polycam | Cloud | ✅ | ✅ (LiDAR) | Subscription | ❌ not self-serve |
| Niantic NSDK 4.0 | On device + cloud | ❌ spaces | ✅ | Partner program | ⚠️ partner gated |
| RealityScan Mobile | On device | ✅ | ~ | Free app | ❌ no SDK |
| COLMAP + OpenMVS | Your server | ✅ | ❌ needs reference | Infra only | ✅ but you operate it |
| ARCore alone | On device | — | ✅ poses | Free | ✅ capture only, no reconstruction |

The row that matters: **nothing in this table both runs on device and reconstructs objects as a
linkable Android dependency.** Every viable path routes through a server.
