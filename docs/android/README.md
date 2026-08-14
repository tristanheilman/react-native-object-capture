# Android

Research into whether `react-native-object-capture` can offer the same API surface on Android,
what the platform provides today, where it's heading, and what to do about it.

**Researched 13 August 2026.** Everything here was checked against primary sources on that date —
Google's ARCore and Android XR documentation, vendor API docs, and this repository's own source.
Vendor pricing and API shapes move; re-verify before committing money or code to any of it.

## Documents

| Document | What it answers |
|---|---|
| [`CURRENT_STATE.md`](CURRENT_STATE.md) | What this repo ships on Android today, and what actually happens at runtime |
| [`PLATFORM_CAPABILITIES.md`](PLATFORM_CAPABILITIES.md) | What Android itself gives you — ARCore, depth, hardware, viewers — and which devices |
| [`THIRD_PARTY_OPTIONS.md`](THIRD_PARTY_OPTIONS.md) | Every route to reconstruction on Android: cloud APIs, SDKs, self-hosted |
| [`ROADMAP_SIGNALS.md`](ROADMAP_SIGNALS.md) | Where Google is taking AR on Android, and what would have to change |
| [`RECOMMENDATION.md`](RECOMMENDATION.md) | The call, the reasoning, and the concrete next steps |

## The short version

Apple's Object Capture is two things bolted together: a **guided capture UI** that tells the user
where to move, and an **on-device reconstruction engine** that turns the resulting images into a
scaled USDZ. Android has no equivalent to either, and no announced plan to build one.

- **Capture guidance** is buildable on Android. ARCore supplies camera pose, tracking quality and a
  depth map on ~88% of active devices, which is enough raw material to reimplement coverage
  tracking and user feedback — but it is a reimplementation, not a wrapper.
- **Reconstruction** is not. There is no Android reconstruction API at any level. Every working
  Android product in this space either uploads to a server or ships its own engine. The realistic
  options are a paid cloud API (KIRI Engine's REST API is the most accessible, ~$1/scan) or
  self-hosting COLMAP/OpenMVS on a GPU box.
- **Hardware is the quiet killer.** Google's own supported-device list shows every Android phone
  with a hardware depth sensor is a 2019–2020 model. OEMs abandoned ToF; there is no Android
  LiDAR tier to target the way this library targets iPhone 12 Pro and later.
- **Google's AR investment has moved to headsets and glasses.** ARCore for Jetpack XR is where the
  new perception work lands, phones are a developer-preview afterthought on it, and none of it
  includes mesh reconstruction or object capture.

**Recommendation: no action on native Android parity.** Delete the misleading stubs, make the
Android degradation honest and documented, and — only if demand appears — add a pluggable
reconstruction backend rather than an Android implementation. Full reasoning and the alternatives
considered are in [`RECOMMENDATION.md`](RECOMMENDATION.md).
