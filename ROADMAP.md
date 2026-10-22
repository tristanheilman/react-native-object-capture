# Roadmap

This file is the goal and phase plan the roadmap planner reads. The detailed
record of what has shipped and what is planned stays in
[`docs/ROADMAP.md`](docs/ROADMAP.md).

## Goal
react-native-object-capture brings Apple's Object Capture and
PhotogrammetrySession to React Native. The flow is a guided 3D scan of a real
object, then an on-device USDZ reconstruction, then real-world dimensions in
metres. It supports the New Architecture only, on iOS 17+ devices with LiDAR,
for app developers building AR scanning features. Done means a 1.0 that teams
can rely on across the devices, iOS versions and React Native versions it claims
to support, with a scan catalog and room-scale capture alongside single-object
capture.

## Phases
### Phase 1 — New Architecture and the capture-to-dimensions flow [done]
Evidence: version 0.2.9 is on npm (2026-10-08). Capture, reconstruction and the dimensioned model were verified on an iPhone 16 Pro Max on iOS 26 (`docs/ROADMAP.md`). 74 Jest tests pass, CI builds iOS and Android, and `rn-compat.yml` builds the React Native floor and latest every week.
### Phase 2 — Proven across devices and React Native versions [current]
Exit when:
- The support matrix in `docs/agent/plans/2026-09-02-rn-version-support-matrix.md` is implemented: for each supported React Native version, CI shows which native view registration path is used (the Fabric `*ComponentView.mm` or the legacy `*Bridge.m`), and the unused path is removed or documented as needed.
- The README's compatibility table lists every device and iOS version with a passing report on #32. Today only one device is verified.
### Phase 3 — Scan catalog [next]
Exit when: scans persist across app launches with metadata and thumbnails, can be listed and deleted from the JS API, and the example app shows the catalog (#35).
### Phase 4 — Room-scale capture [next]
Exit when: a `RoomPlanView` component captures a room on a real device and returns its model and dimensions to JS, shown in the example app (#34).
### Phase 5 — 1.0 [next]
Exit when: 1.0.0 is published with the API documented as stable under semver, plus upgrade notes from 0.2.x.

## Side quests
- Write a troubleshooting guide for the common setup failures: the Podfile deployment target, the Expo config plugin, and running on a device without LiDAR. These are the questions a new adopter hits first.
- Document what a scan costs on each device tested: image count, folder size and reconstruction time. App developers need this to plan storage and UX.
- Offer a TestFlight build of the example so people sending compatibility reports for #32 don't need Xcode. The 2026-10-06 decision ruled out an App Store app but left this open.

## Reserved for the owner
- Merging the release-please Release PR, which publishes to npm. It is always the maintainer's call and never part of another task (`AGENTS.md`).
- The merge method (squash or rebase), which changes the changelog's shape, and the Conventional Commits setup.
- Anything that competes with or rewrites an outside contributor's claimed PR.
- Apple developer account actions such as TestFlight and signing, deleting branches, and changing the licence.

## Settled
- **No native Android parity.** Android has no reconstruction API, and no current device has a depth sensor. Future Android work waits for evidence of demand (`docs/android/RECOMMENDATION.md`).
- **No App Store example app.** It would overlap Apple's free Reality Composer and adds no device-gating value. Decided 2026-10-06 (`docs/agent/log.md`); don't re-propose it without a new reason.
- **`ci.yml` does not run on push to main**, to avoid repeating the PR and merge-queue checks (comment in `ci.yml`).
- **No React Native version matrix on every PR.** `rn-compat.yml` runs weekly instead, because a docs or JS change can't affect which versions build.
- **No ccache for iOS CI yet.** It's not worth it now that the prebuilt core cut build time (`docs/agent/log.md`, 2026-10-07).
