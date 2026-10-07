# AGENTS.md

Guidance for contributors and their coding agents working in this repository.
`CLAUDE.md` imports this file, so Claude Code and tools that read `AGENTS.md`
get the same rules.

## What This Is

A React Native library wrapping Apple's Object Capture (LiDAR photogrammetry):
scan a real object, get a dimensionally-accurate USDZ. It is a **published npm
package with external users and outside contributors** — that is the constraint
that shapes everything below. A broken release does not inconvenience one
developer; it lands in other people's builds.

**iOS only, and permanently so.** Android has no reconstruction API at any level
to build this on. `android/` exists to degrade with a message naming the reason
rather than failing obscurely — it is not an unfinished port, and it should not
be "completed". The full survey of what Android does and doesn't offer is in
[`docs/android/`](docs/android/README.md); read it before proposing Android work.

## Requirements That Bound Every Change

- **iOS 17.0+**, **iPhone 12 Pro or newer** (LiDAR).
- **React Native 0.79+ with the New Architecture enabled** (`README.md`,
  Requirements). `peerDependencies` says `react-native >=0.79.0`, which is a
  floor on *version* — npm has no way to express "New Architecture enabled", so
  the range cannot enforce the real requirement.
- Most work here **needs no device**. Anything that genuinely does carries the
  `needs device` label. Don't claim a change is verified because CI is green:
  CI compiles, it does not scan an object.

## Commands

```sh
yarn lint            # eslint
yarn typecheck       # tsc
yarn test            # jest
yarn prepare         # bob build — produces lib/, what actually ships
yarn example ios     # run the example app
yarn example android
```

Native changes: compile before pushing, rather than waiting ~20 min for CI.
No device or signing needed:

```sh
cd example/ios && xcodebuild -workspace ObjectCaptureExample.xcworkspace \
  -scheme ObjectCaptureExample -configuration Debug \
  -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

Package manager is **Yarn 3.6.4 (Berry)**, not npm — `yarn install --immutable`
in CI. `example/` is a workspace, and `turbo` drives `build:ios` / `build:android`
against it. Node is pinned by `.nvmrc`; CI reads it via `node-version-file`
rather than hardcoding a version, so bumping `.nvmrc` moves CI too.

## Layout

- `src/specs/` — codegen specs. A spec edit regenerates native interfaces, so
  it is a native change, not a TypeScript change.
- `src/modules/` — the JS API (`ObjectCaptureSession`, `PhotogrammetrySession`);
  `src/components/` — the view wrappers.
- `ios/Session/` — capture session and photogrammetry; `ios/View/` — SwiftUI
  views and the Fabric containers.
- `example/` — the workspace app. It doesn't ship, so example-only commits are
  `chore(example)`: no changelog line, no version bump.

## The Native Surface Has Two Paths, Not One

Worth knowing before touching `ios/`, because it is easy to assume one and break
the other:

- **Fabric** — three `*ComponentView.mm` containers (`RNObjectCaptureView`,
  `RNObjectCapturePointCloudView`, `RNQuickLookView`), registered through
  `codegenConfig.ios.componentProvider` in `package.json`.
- **Legacy view managers** — `*Bridge.m` files declaring
  `RCT_EXTERN_MODULE(..., RCTViewManager)` with `RCT_EXTERN_METHOD` commands.

Both exist today. Which one is load-bearing on which RN version is **not
currently tested** — see `docs/agent/plans/2026-09-02-rn-version-support-matrix.md`.
Do not "clean up" either path on the assumption it is dead code.

`codegenConfig` (spec name `ObjectCaptureSpec`, `jsSrcsDir: src/specs`) is
generated tooling input.

Fabric also **recycles** native views: a second mount can receive the first
one's container with new props. Native containers must handle a prop changing
on a live instance (see `RNQuickLookViewFabricContainer.setPath`).

## RealityKit Behaviour That Isn't Documented

`ObjectCaptureSession` has timing behaviour Apple doesn't document, verified on
device: `isPaused` updates asynchronously, starting a pass on a paused session
loses a `resume()` sent straight after, and `beginNewScanPassAfterFlip()` traps
if called right after `resume()`. The workarounds are commented in
`ios/Session/RNObjectCaptureSessionManager.swift` — read them before touching
pause/resume/new-pass code, and re-verify any change there on a device.

## CI and Release — Two Deliberate Choices

**`ci.yml` does not run on push to `main`.** Only `pull_request` and
`merge_group`. The reasoning is in a comment at the top of the file: PRs and the
merge queue already ran the full matrix, and the iOS build is ~20 minutes.
Re-running it on merge is pure duplication. Don't "fix" this by adding a push
trigger.

**Releases are release-please.** An always-open Release PR accumulates the
version bump and CHANGELOG from conventional commits; merging it tags, releases,
and publishes to npm with provenance. So:

- **Commit messages are load-bearing.** Conventional Commits, enforced by
  commitlint via lefthook. The commit type determines the version bump and the
  changelog line users read.
- **Never merge the Release PR as part of another task.** That publishes to npm.
  It is the maintainer's call, always.
- **Merge method changes the changelog.** Squash collapses a multi-commit PR
  into one line; rebase-merge keeps one line per commit.
- **The Release PR shows "no checks".** It is opened with the `GITHUB_TOKEN`,
  which doesn't trigger workflows. Expected, not broken.

## Working With Outside Contributors

This repo receives real external PRs. Two things follow:

- **First-time-contributor workflows sit in `action_required` until approved.**
  Their CI has not failed; it has not run. Don't read a missing check as a
  problem with their code.
- **Don't rewrite someone's open PR from a ticket.** If a ticket has a PR
  against it, the work is claimed. Say so and move on rather than producing a
  competing branch.

## Conventions

- **Say why, not what.** The reasoning is what doesn't survive six months. Match
  the density already in `ci.yml`, `release.yml`, and the issue backlog — those
  explain *why* the choice was made, not what the line does.
- **Degrade with a reason.** Every unsupported call names what is missing and
  what to check. `ObjectCaptureSession.isDeviceSupported()` is the capability
  gate to branch on — prefer it over `Platform.OS`, since plenty of iOS devices
  lack LiDAR too.
- **Don't widen scope into the roadmap.** `docs/ROADMAP.md` and the issue
  backlog hold deliberately-deferred work. Deferred is a decision, not an
  oversight.

## Agent Coordination

This file, `CLAUDE.md`, `.claude/` and `docs/agent/` are committed on purpose: the repo takes outside
contributions, and contributors' coding agents benefit from the same
constraints. That openness covers **these guidance files
only**. Commits, PR bodies, issues and release notes carry no AI attribution —
no `Co-Authored-By` trailer, no session links, no "Generated with" footers. And
write log entries for a public audience: technical findings, not account
details, business reasoning, or references to the maintainer's private repos.

Before starting, read [`docs/agent/log.md`](docs/agent/log.md) **and** the plan
files it links, so runs don't repeat or collide with each other. Add a line to
the log when you finish. Plans live in `docs/agent/plans/`.
