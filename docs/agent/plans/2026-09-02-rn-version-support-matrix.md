# Make the supported React Native range true — measure both ends before narrowing `peerDependencies`

**Date:** 2026-09-02
**Status:** done 2026-10-09. Weekly `rn-compat.yml` instead of a per-PR matrix (see the log entry); the floor measured true, so `react-native >=0.79.0` stays.
**Tracks:** [#40](https://github.com/tristanheilman/react-native-object-capture/issues/40)
**Type:** CI matrix + manifest correctness (codeable, no device; one owner decision at the end)
**Effort:** Medium (~3–4 hrs, mostly CI iteration) · **Impact:** Medium (turns an unverified support claim into a tested one, for a package other people install)

---

## TL;DR

`peerDependencies` promises `react-native >=0.79.0`. CI builds exactly one
version, `0.83.10`, and React Native is now on **0.87.1**. Nine minor versions
advertised, one exercised, and the gap grows with every RN release.

The instinct is to raise the floor. **Don't — not yet.** Nothing has ever built
the floor, so nobody knows whether it works. Narrowing it on a guess would drop
consumers who may be perfectly fine. Measure both ends, then let the measurement
set the range.

---

## Sequencing — read before starting

**This plan touches `package.json`, and two open PRs already do:**

- **PR #39** (external contributor — Expo config plugin) modifies `package.json`
- **PR #26** (release-please — chore(main): release 0.2.7) modifies `package.json`

Starting here first means a merge conflict against unreviewed outside work, and
resolving it means rewriting a contributor's diff. **Land #39 and #26 first.**
Then rebase and start.

[#41](https://github.com/tristanheilman/react-native-object-capture/issues/41)
(`docs/agent/plans/2026-09-02-ci-node-runtime-and-action-majors.md`) touches only
workflow files and has no such overlap — it can run immediately and in parallel.

## What exists today

Verified against `origin/main` at `08c1c83` on 2026-09-02.

- **`package.json`** — `peerDependencies`: `react >=18.2.0`, `react-native >=0.79.0`.
- **`devDependencies`** — `react-native 0.83.10`, `react 19.2.0`,
  `@react-native/babel-preset 0.83.10`, `@react-native-community/cli 20.0.0`.
- **`ci.yml`** — five jobs, all installing that single pinned version. No matrix
  dimension for React Native anywhere.
- **`README.md` line 30** — "React Native 0.79 or later with the New Architecture
  (Fabric / TurboModules) enabled". The requirement *is* documented; it is simply
  not tested, and `peerDependencies` cannot express the New Architecture half.

**React Native minor lines at or above the pin** (npm registry, 2026-09-02):

| Line | First release | Note |
|---|---|---|
| 0.83.x | 2025-12-10 | the pinned line; `0.83.10` released 2026-06-25 |
| 0.84.x | 2026-02-11 | |
| 0.85.x | 2026-04-07 | |
| 0.86.x | 2026-06-09 | |
| 0.87.x | 2026-08-11 | `0.87.1` (2026-08-26) is `latest` |

Note the interleaving: 0.84, 0.85 and 0.86 all opened **before** `0.83.10`
shipped, because the 0.83 line kept taking patches after newer minors existed.
So the pin is not "the version at the time" that has since been overtaken — it
is a maintained patch on a line that was already **four minors behind** when it
was picked up. The staleness is structural, not drift.

### A second inconsistency, same root

`peerDependencies.react` says `>=18.2.0`, but React Native has shipped React 19
since 0.78 — and this package's own floor is RN 0.79. So "React 18.2 + RN 0.79"
is not a combination that exists. The React floor is stale in the same way and
by the same mechanism: written once, never re-checked. Fix it in the same pass,
driven by the same measurement.

## Why it matters

The package has outside users and outside contributors. A peer range is a
promise npm enforces at install time on their machines, not ours. Today that
promise is unbacked in both directions:

- **Upward** — someone on RN 0.87 (current, and the default for anyone starting
  a project today) installs cleanly with no signal that it has never been built
  against their version. If it breaks, it breaks in their native build, which is
  the most expensive place to discover it.
- **Downward** — someone on 0.79 gets the same clean install with the same
  absence of evidence.

The native surface makes this genuinely uncertain rather than theoretically
uncertain. There are **two** paths in `ios/`, and which is load-bearing on which
RN version has never been established:

- **Fabric** — 3 `*ComponentView.mm` containers registered via
  `codegenConfig.ios.componentProvider`.
- **Legacy view managers** — `ios/View/RNObjectCaptureView/RNObjectCaptureViewBridge.m`
  and siblings, declaring `RCT_EXTERN_MODULE(..., RCTViewManager)` with
  `RCT_EXTERN_METHOD` commands.

RN 0.83 removed the Legacy Architecture from core. The package spans that
boundary on paper. Whether the floor still builds — and whether it needs the New
Architecture explicitly enabled to do so — is exactly what nobody has run.

## Evidence & sources (verified 2026-09-02)

- **In-repo:** `package.json` (`peerDependencies`, `devDependencies`, `codegenConfig`); `ci.yml` (no RN matrix; `build-ios` on `macos-latest`, ~20 min per the comment at the top of the file); `README.md:30`; `ios/View/RNObjectCaptureView/RNObjectCaptureViewBridge.m` (`RCT_EXTERN_MODULE(..., RCTViewManager)`); 3 × `*ComponentView.mm`.
- **RN versions:** npm registry `react-native` — latest `0.87.1`, published 2026-08-26.
- **Legacy Architecture removed in 0.83:** [Callstack — React Native 0.83](https://www.callstack.com/events/react-native-0-83), [RN 0.83 release coverage](https://www.creolestudios.com/react-native-0-83-zero-breaking-changes/).
- **`componentProvider` history:** introduced around RN 0.77, with third-party libraries warned from 0.77.0 if `codegenConfig.ios.componentProvider` was absent — so on that axis a 0.79 floor is defensible ([reactwg/react-native-new-architecture codegen docs](https://github.com/reactwg/react-native-new-architecture/blob/main/docs/codegen.md), [RN 0.80 Fabric native components](https://reactnative.dev/docs/0.80/fabric-native-components-introduction)).

## Concrete recommendation (step by step)

1. **Add an RN dimension to the iOS build job.** A `matrix.react-native` over
   `[pinned, latest]` — `0.83.10` and `0.87.x` today. Resolve `latest` at run
   time rather than hardcoding, so the matrix does not go stale the same way the
   peer range did. The install needs `react-native`, `react`, and
   `@react-native/babel-preset` moved together; a bare `react-native` override
   will fail on a preset mismatch.
2. **Build the floor once, out-of-band.** Add `0.79.x` as a
   `workflow_dispatch` / scheduled variant, not a per-PR job — the iOS build is
   ~20 minutes and the floor moves roughly never. Run it once by hand as part of
   this work.
3. **Record what the floor actually does** in #40: builds clean / builds only
   with `newArchEnabled=true` / does not build. This is the deliverable that
   unblocks every later decision, and it is worth writing down even if the
   answer is boring.
4. **Set both floors from the measurement.** Move `react-native` to the oldest
   version that demonstrably builds, and `react` to whatever that RN version
   actually ships with (React 19 if the floor stays ≥0.79) — not `18.2.0`.
5. **Keep `README.md:30` in lockstep.** If the floor moves, the Requirements line
   moves in the same commit. Two places stating a version is one place too many
   already; they must not be allowed to disagree.
6. **Don't chase every minor.** Pinned + latest per PR, floor on demand. Building
   0.84/0.85/0.86 as well buys little and costs ~20 minutes each.

## Effort / impact

- **Effort:** Medium, ~3–4 hrs — most of it CI iteration, since matrix work is
  slow to validate and the iOS job is the long pole. No source changes expected
  unless the floor build surfaces a real break, which is a separate ticket.
- **Impact:** Medium. Nothing changes for a consumer on 0.83 today. The value is
  that the range stops being a guess for everyone else, and that RN 0.87 — what
  a new project gets by default — becomes a tested target rather than an
  assumption.

## Codeable vs. owner

**Codeable up to step 4**, which contains **one owner decision**: narrowing
`peerDependencies` is a breaking change for anyone it excludes, and it interacts
with release-please's version bump. Bring the floor measurement back and let the
maintainer choose the range.

Everything before that — matrix wiring, the floor build, recording the result —
needs no owner and no device.

## Acceptance criteria (verifiable)

- [ ] `ci.yml` builds the example against current-latest RN in addition to the pinned dev version, with `latest` resolved at run time
- [ ] A 0.79.x floor build has been run at least once and its outcome recorded in #40
- [ ] `peerDependencies.react-native` and `peerDependencies.react` both reflect that measurement
- [ ] `README.md:30` agrees with `package.json` — no version stated in one place and contradicted in the other
- [ ] Per-PR CI wall-clock has not materially regressed (the floor build is not on the per-PR path)
- [ ] `yarn prepare` output (`lib/`) is byte-identical before and after — this is a manifest and CI change, not a build change
