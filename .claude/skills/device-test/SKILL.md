---
name: device-test
description: Build the example app to a connected LiDAR iPhone, stream its console, and verify native behaviour on real hardware — or compile-check native code when no phone is attached. Use whenever a change touches ios/ (especially ObjectCaptureSession pause/resume/scan-pass code, Fabric containers, QuickLook), when the user asks to "build to my phone", "test on device", "try it on the iPhone", or reports something broken on device, and before claiming any native change works. CI only compiles; it never scans an object.
---

# Device test

CI compiles the library; it can't run Object Capture. Anything in `ios/` that
changes runtime behaviour is unverified until it has run on a LiDAR iPhone
(12 Pro or newer, iOS 17+). This skill is how to get it there quickly and get
evidence back.

## Build, install, launch

```sh
.claude/skills/device-test/scripts/device-run.sh            # build, install, launch with console
.claude/skills/device-test/scripts/device-run.sh --no-launch
.claude/skills/device-test/scripts/device-run.sh --compile-only   # no phone, unsigned
.claude/skills/device-test/scripts/device-run.sh --log /path/console.log
```

- Run the launching form with `run_in_background` — it blocks until the app
  exits, streaming everything the app prints to the log file (default
  `$TMPDIR/rnoc-console.log`).
- It builds **Release**, which bundles the JS, so the phone doesn't need Metro.
- It finds the first available, paired iPhone itself. If none is found, ask the
  user to connect and unlock it; don't hard-code device IDs.
- Installing over a running app kills it. If the user is mid-task on the phone
  (e.g. a reconstruction is running), check the log for completion first.
- A launch command that ends with exit 144 is just the console stream being
  stopped when you relaunch — not a failure.

## Getting evidence: temporary logging

When behaviour is unclear, add temporary `print("DIAG …")` lines around the
calls in question and log the state you're reasoning about, with timestamps
when ordering matters:

```swift
print("DIAG t=\(Date().timeIntervalSince1970) before: paused=\(session.isPaused) state=\(session.state.stringValue)")
```

Then give the user exact steps to reproduce on the phone, and read the log
with a filter rather than dumping it:

```sh
grep -E "DIAG|state changed|scan pass|signal" "$TMPDIR/rnoc-console.log" | grep -v "Feedback\|Tracking"
```

Change one variable per device run. Each run costs the user a physical scan
(about a minute), and a run that changes two things can't tell you which one
mattered. The #45 scan-pass freeze took four runs to pin down: the first two theories
(an `isPaused` guard, then a skip flag) were wrong, and only the logs showed it.

`App terminated due to signal 5` is a SIGTRAP — RealityKit deliberately
crashing on an invalid call. Note which call ran last.

## Before committing

Temporary logging must never ship:

```sh
grep -rn "DIAG" ios example/src && echo "remove DIAG lines first"
```

Then do a final build of exactly what's committed (`--no-launch` is enough)
and leave that build on the phone, so the user is left with the shipped code.

## Reporting

In PR bodies and summaries, separate what ran on the device from what only
compiled. Name the device and iOS version. A path that the UI can no longer
reach (so it couldn't be exercised) is "compile-checked only", even if Apple's
docs back the reasoning.
