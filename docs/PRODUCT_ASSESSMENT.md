# Product & Market Assessment — July 2026

An honest read on what `react-native-object-capture` currently is, what the original
"will my furniture fit in this apartment" idea would actually require, what the market
looks like now that generative 3D has landed, and where (if anywhere) the money is.

> **Update (post-assessment):** the top engineering recommendation below — migrating to the New
> Architecture (§2.1, §5) — has since shipped. The library now uses Fabric component views and
> TurboModules, and the example builds green on iOS and Android in CI (device verification still
> pending). See [`ROADMAP.md`](ROADMAP.md) for current status. The market analysis is unchanged
> and preserved as written.

---

## 1. What we actually have today

**A working, iOS-only React Native wrapper around Apple's Object Capture + PhotogrammetrySession.**
Roughly 4,200 lines across TS and Swift. It is real, it is reasonably well tested, and it
is genuinely the only one of its kind on npm/GitHub.

### Shipped surface

| Piece | File(s) | State |
|---|---|---|
| `ObjectCaptureView` — guided capture UI, session lifecycle, 15 imperative methods | `src/components/RNObjectCaptureView.tsx`, `ios/View/RNObjectCaptureView/*`, `ios/Session/RNObjectCaptureSessionManager.swift` | Working |
| `ObjectCapturePointCloudView` — live point-cloud preview between scan passes | `src/components/RNObjectCapturePointCloudView.tsx`, `ios/View/RNObjectCapturePointCloudView/*` | Working |
| `QuickLookView` — USDZ preview via `QLPreviewController` | `src/components/RNQuickLookView.tsx`, `ios/View/RNQuickLookView/*` | Working |
| `PhotogrammetrySession` — reconstruction with 11 event listeners + progress | `src/modules/PhotogrammetrySession.ts`, `ios/Session/RNPhotogrammetrySession.swift` | Working |
| State hooks (`useSessionState`, `useTrackingState`, `useFeedbackState`, `useObjectCapture`) | `src/hooks/*` | Working |
| Example app — 7 screens, full capture → reconstruct → preview flow | `example/src/*` | Working demo |
| Tests | `src/__tests__/*` (~1,250 lines) | Good coverage of the JS layer |
| Android | `android/src/main/java/com/objectcapture/*` | **Hard stub.** Module is empty, photogrammetry rejects `NOT_IMPLEMENTED`, view manager returns a bare `View` |

### Traction

- npm: `0.2.3`, last published **2025-06-19**. Effectively dormant for 13 months.
- GitHub: 4 stars, 0 forks, 0 open issues.
- README carries a prominent "NOT ready for production" warning.

**Verdict on the library:** it's a solid 60–70% of one useful component. It is not a product.

---

## 2. Blockers that must be fixed before anything else

These are ordered by severity. #1 is existential.

### 2.1 The library is legacy-architecture only — it does not target any current React Native

Everything is built on the pre-New-Architecture bridge:

- `requireNativeComponent` in all three components (`RNObjectCaptureView.tsx:87`,
  `RNObjectCapturePointCloudView.tsx:54`, `RNQuickLookView.tsx:18`)
- `RCTViewManager` / `RCT_EXTERN_MODULE` for every native view
  (`ios/View/RNObjectCaptureView/RNObjectCaptureViewBridge.m:4`, etc.)
- `RCTEventEmitter` + `NativeModules` + `NativeEventEmitter` for both native modules
  (`ios/RNObjectCapture.swift:5`, `ios/Session/RNPhotogrammetrySession.swift:9`)
- `codegenConfig` in `package.json` declares `"type": "modules"`, but **no file actually
  uses `TurboModuleRegistry` or `codegenNativeComponent`**. The codegen config is vestigial —
  it generates nothing that is used.

React Native **0.82** (Oct 2025) removed the ability to disable the New Architecture;
`newArchEnabled=false` and `RCT_NEW_ARCH_ENABLED=0` are now ignored. **0.83** removed the
legacy architecture from the codebase, and apps can compile it out entirely with
`RCT_REMOVE_LEGACY_ARCH=1`. This library currently survives only through the deprecated
interop layer, and not at all once legacy code is compiled out.

The example app pins `react-native` `0.79.2`, i.e. the last era where this design was normal.

**This is the first commit of any continuation.** Fabric components
(`codegenNativeComponent` + `RCTViewComponentView` on the Swift side) and a real TurboModule
spec. Nothing else matters until this is done.

### 2.2 The single most important number for the product idea is not exposed

For "will it fit," the answer is **width × depth × height in meters**. The current pipeline
never surfaces it:

- `ios/Session/RNPhotogrammetrySession.swift:109` constructs a bare
  `PhotogrammetrySession.Configuration()` — no detail level, no bounds.
- `session.process(requests: [.modelFile(url: outputURL)])` at line 124 — `.bounds` and
  `.poseData` requests are never issued.
- The `ObjectCaptureSession` bounding box (the box the user positions during the `detecting`
  state) is captured natively but never bridged to JS.

Object Capture already knows the real-world extent. We just throw it away. Fixing this is
maybe 100 lines and it is the difference between "a 3D scanning demo" and "a product."

### 2.3 Smaller code issues

- `ios/Session/RNPhotogrammetrySession.swift:54-57` — `outputPath` is split on `/` and indexed
  at `[0]` and `[1]`. A flat path (`"model.usdz"`) crashes on index-out-of-range; a nested path
  (`"Outputs/chair/model.usdz"`) silently writes to the wrong place.
- `finishSession` is implemented end-to-end (`RNObjectCaptureView.tsx:287`,
  `RNObjectCaptureSessionManager.swift:346`) and used by the example
  (`example/src/ScanPassStageModal.tsx:55`), but is missing from the README methods table.
- No detail-level control (`.reduced` / `.medium` / `.full` / `.raw`). For furniture-fit,
  `.reduced` is both faster and sufficient — right now users always pay for max quality.
- No output catalog beyond `listDirectoryContents`. No persistence, no metadata, no thumbnails.

---

## 3. What the original idea needs that this repo does not contain

The furniture-fit product is a three-legged stool. We have part of one leg.

| Leg | Needed | Have |
|---|---|---|
| **Scan the object** | Object Capture + real-world dimensions | ~70% (dimensions missing) |
| **Capture the target room** | RoomPlan — walls, doors, windows, openings, parametric floor plan | **0%.** Not in this repo at all |
| **Place & test fit** | AR placement, collision/clearance checks, doorway and stairwell pathing, saved layouts | **0%** |

Also absent: any backend, account system, model catalog, sharing, or cross-device sync.

`RoomPlan` runs entirely on-device, scans a room in 60–90 seconds, and is the obvious second
leg. A community wrapper already exists ([`fordat/expo-roomplan`](https://github.com/fordat/expo-roomplan)),
which is either a dependency to adopt or evidence that adding a `RoomPlanView` here is tractable.

**Realistic estimate to a shippable v1 of the original idea:** 3–5 months of focused solo work,
of which the scanning piece — the part that's done — was never the hard part.

---

## 4. The market as of mid-2026

### 4.1 Generic 3D scanning is solved, free, and commoditized

Four mature apps handle the full capture pipeline on phones, and the good ones are free:

- **Scaniverse** (Niantic Spatial) — free, no subscription, first to do 3D Gaussian Splatting
  entirely on-device.
- **Polycam** — freemium. 2026 pricing: Free / Basic $30 per month or $150 per year /
  Business $400 per year per seat / Enterprise. Has measurement and volume tools that hit
  **98–99% accuracy** on well-cropped scans.
- **KIRI Engine** — freemium, mesh-inclusive Gaussian splatting, strongest on Android.
- **RealityScan** (Epic) — free, strong on both platforms.

Polycam already ships dimension measurement. That specific feature is not a wedge.

### 4.2 Generative 3D has changed what "hard" means

Meshy 6 turns a single photo into a ~600K-face mesh in about a minute. Tripo's Smart Mesh P1.0
does quad retopology in ~2 seconds. Tencent's Hunyuan3D 3.5 is open source and competitive.
Shape accuracy on front-facing surfaces is roughly 80–95%.

Two implications, pulling in opposite directions:

- **Against us:** the scarcity that made a LiDAR photogrammetry wrapper interesting is gone.
  Anyone can get a usable 3D couch from one photo, no LiDAR, no scan pass, no 3-minute
  reconstruction.
- **For us:** generative models *hallucinate scale*. They produce a plausible couch, not
  *your* couch at 2.13m. For a fit-checking product, metric accuracy is the entire value
  proposition, and that's exactly what LiDAR + Object Capture gives and generative 3D does not.
  The consensus read is "prototype quality is easy now, production quality is not."

**This is the one genuinely defensible technical position left: measured, not generated.**

### 4.3 The consumer "will it fit" niche is already occupied

Live on the App Store today: *Will It Fit? — AR Measure Box*, *Smart Moving: Furniture Helper*
(which already measures door frames, staircases, elevators, and accounts for rotation and
tilting during transport), *Measure Tools: AR Room Planner*, *AR Plan 3D*, and **magicplan**,
which consistently tops room-measurement charts and produces 2D/3D floor plans in under a
minute per room.

None of them dominate, but the space is crowded, and the honest problem is that **a tape
measure answers the question for free**. Consumer willingness to pay for "will my couch fit"
is low and the need is transient — people move once every several years.

### 4.4 Where money is demonstrably changing hands

**B2B, not consumer.**

- **Yembo** — $13.9M raised. Customer records a smartphone walkthrough; AI generates a visual
  inventory, measurements, 3D models, floor plans, and volume/weight estimates for moving
  quotes. Sells to moving companies and insurers.
- **HomeSurvey.ai** — undercutting Yembo at $20 per survey with no subscription. The existence
  of a price-based competitor is a signal that the category is real enough to attack.
- **Polycam** — ~$8.8M revenue in 2026 (up from ~$6.5M gross in 2023), $18M raised. Notably its
  growth came from *professional* users — construction, real estate, as-builts — not hobbyists.
- **Zillow 3D Home** — free to agents, panorama-based. Listings with an interactive floor plan
  or 3D tour get **2× the views** and sell ~10% faster. Zillow gives it away because the value
  accrues to the marketplace, not the tool.

Market context: 3D scanning overall is ~$6.46B in 2026 heading to ~$16.65B by 2034 (12.6% CAGR),
but that number is dominated by industrial metrology hardware, not phone apps. Don't anchor on it.

---

## 5. The honest verdict

**Is there money in object scanning?** Yes — but essentially none of it is in *scanning*.
It's in the workflow the scan feeds: a mover's quote, an insurance claim, a real-estate listing,
a resale listing, a construction as-built. Scanning is a free feature inside a paid workflow.
Polycam's revenue came from pros. Yembo's came from movers. Zillow gives the scanner away entirely.

**Can this repo iterate into a functional app?** Yes, technically. Two-thirds of the product
doesn't exist yet, and the third that does needs an architecture migration before it runs on a
current React Native. That's real but ordinary work.

**Should the app be the original furniture-fit idea?** Probably not as the primary bet.
It's crowded, the willingness to pay is low, the need is once-every-few-years, and free
alternatives (including an actual tape measure) answer the question adequately.

### Three paths, ranked

**A. Fix and maintain the library as a portfolio/credibility asset. (Highest confidence, lowest revenue.)**
It is uncontested — GitHub search for `object capture react-native in:name` returns exactly one
result, this repo. Migrate to Fabric/TurboModules, expose dimensions and detail level, publish
1.0, add a RoomPlan view. Realistic outcome: hundreds of weekly downloads, some consulting
inbound, near-zero direct revenue. Cost: a few focused weekends. This is worth doing regardless
of which other path you pick, because every other path depends on it.

**B. Furniture resale / marketplace listings. (Best consumer wedge, moderate confidence.)**
Scan the couch → get a measured 3D model *and* an auto-generated listing with exact dimensions,
clean cutout photos, and a suggested price. The pain is real and recurring: Facebook Marketplace
and Craigslist listings almost never include dimensions, and that's the #1 buyer question. This
reframes measurement from "nice to have" to "the thing that makes the listing sell." Monetize on
listing volume or a seller subscription. Recurring need, unlike moving.

**C. B2B vertical — small movers, self-storage, or property management. (Highest revenue ceiling, highest effort.)**
Yembo proved the category and is priced for mid-to-large national movers. The underserved segment
is the 2–10 truck regional operator. But this is a sales business with a software component, not a
software business — and you'd be competing with a funded incumbent and a $20/survey discounter.
Only worth it with a real distribution channel.

**What I'd actually do:** Path A now (it's a prerequisite for everything and it's cheap), then
validate Path B with a throwaway prototype on top of the fixed library before committing
months. Keep the furniture-fit feature — but as a *feature* inside a resale or moving flow,
not as the product.

### The one thing to hold onto

Everyone can generate a 3D model now. Almost nobody can hand you a model that's dimensionally
correct to the centimeter. Whatever gets built, the pitch is **"measured, not guessed."**

---

## 6. Concrete next commits, in order

1. **Migrate to the New Architecture.** `codegenNativeComponent` for all three views,
   `RCTViewComponentView` subclasses on the Swift side, a real `TurboModuleRegistry` spec for
   both native modules. Bump the example app to a current React Native. *(Blocks everything.)*
2. **Expose real-world dimensions.** Add `.bounds` to the request list in
   `RNPhotogrammetrySession.swift:124`, bridge the `ObjectCaptureSession` bounding box, and emit
   `{ width, height, depth }` in meters on `onCaptureComplete`.
3. **Expose `PhotogrammetrySession.Configuration.detail`** as a prop so callers can choose
   `.reduced` for speed.
4. **Fix the `outputPath` parsing bug** at `RNPhotogrammetrySession.swift:54-57`.
5. **Document `finishSession`** in the README methods table.
6. **Add a `RoomPlanView`** — second leg of the stool, and independently the most-requested
   thing anyone would want from an RN spatial library.
7. **Drop or clearly scope the Android stubs.** There is no Android equivalent to Object
   Capture; cross-platform means a cloud reconstruction pipeline, which is a different product.
   Right now the stubs imply a roadmap that doesn't exist.

---

## Sources

- [Apple — Object Capture (RealityKit)](https://developer.apple.com/documentation/realitykit/realitykit-object-capture/)
- [Apple — PhotogrammetrySession](https://developer.apple.com/documentation/realitykit/photogrammetrysession)
- [Apple Developer Forums — Updated Object Capture: needs LiDAR?](https://developer.apple.com/forums/thread/769221)
- [Apple — What's new in RealityKit (WWDC25)](https://developer.apple.com/videos/play/wwdc2025/287/)
- [Apple — Introducing RoomPlan](https://developer.apple.com/augmented-reality/roomplan)
- [Apple ML Research — 3D Parametric Room Representation with RoomPlan](https://machinelearning.apple.com/research/roomplan)
- [React Native 0.82 — A New Era](https://reactnative.dev/blog/2025/10/08/react-native-0.82)
- [reactwg — Implications of 0.83 and removal of legacy architecture code](https://github.com/reactwg/react-native-new-architecture/discussions/309)
- [fordat/expo-roomplan](https://github.com/fordat/expo-roomplan)
- [Scaniverse — Creating splats with your phone: which app should you choose?](https://dev.scaniverse.com/news/creating-splats-which-app-to-choose)
- [Polycam pricing](https://poly.cam/pricing)
- [Polycam — How to Measure Your Captures](https://learn.poly.cam/hc/en-us/articles/29647317758100-How-to-Measure-Your-Captures)
- [Polycam — How to Use the Volume Measurement Tool](https://learn.poly.cam/hc/en-us/articles/42736036898196-How-to-Use-the-Volume-Measurement-Tool)
- [Appfigures — 3D Scanning is a Real Business: Polycam Reaches Revenue Milestone](https://appfigures.com/resources/insights/20240531?f=5)
- [TechCrunch — 3D scanning app Polycam gets backing from YouTube co-founder](https://techcrunch.com/2024/02/07/3d-scanning-app-polycam-gets-backing-from-youtube-co-founder)
- [KIRI Engine — Best LiDAR 3D Scanner Apps for iPhone (2026)](https://www.kiriengine.app/blog/best-lidar-3d-scanner-apps-iphone-2026)
- [Polyvia3D — Best 3DGS Apps 2026](https://www.polyvia3d.com/guides/best-gaussian-splatting-apps)
- [Yembo — Virtual Property Inspections with AI](https://yembo.ai/)
- [PitchBook — Yembo company profile](https://pitchbook.com/profiles/company/234076-24)
- [IEEE Spectrum — This Startup's AI Tool Makes Moving Day Easier](https://spectrum.ieee.org/zach-rattner-yembo-profile)
- [HomeSurvey.ai vs Yembo](https://homesurvey.ai/compare/homesurvey-vs-yembo/)
- [Zillow 3D Home](https://apps.apple.com/us/app/zillow-3d-home/id1265223425)
- [Virtuance — The Power of Zillow 3D Home Tours with Interactive Floor Plans](https://www.virtuance.com/blog/power-of-zillow-3d-home-tours-interactive-floor-plans/)
- [Meshy — Image to 3D](https://www.meshy.ai/features/image-to-3d)
- [see3d — Can AI Image-to-3D Tools Really Work in 2026?](https://see3d.art/blog/detail/Can-AI-Image-to-3D-Tools-Really-Create-Usable-3D-Models-From-Photos-in-2026-c5aa34a7895c/)
- [Trellis2 — Best AI 3D Model Generators in 2026](https://trellis2.app/blog/best-ai-3d-model-generator)
- [Fortune Business Insights — 3D Scanning Market Size](https://www.fortunebusinessinsights.com/3d-scanning-market-102627)
- [Will It Fit? — AR Measure Box](https://apps.apple.com/us/app/will-it-fit-ar-measure-box/id6760420083)
- [Smart Moving: Furniture helper](https://apps.apple.com/us/app/smart-moving-furniture-helper/id1666262699)
- [92interiors — Top 10 apps to measure your room for furniture (2026)](https://92interiors.com/top-10-apps-to-measure-your-room-for-furniture-2026/)
