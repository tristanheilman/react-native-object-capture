# The `build:ios` and `build:android` cache keys hash the example app, not the library — native changes can go green without compiling

**Date:** 2026-09-03
**Status:** done — shipped in [#43](https://github.com/tristanheilman/react-native-object-capture/pull/43), released in 0.2.8
**Tracks:** [#42](https://github.com/tristanheilman/react-native-object-capture/issues/42)
**Type:** CI correctness (fully codeable, no owner action, no device)
**Effort:** Low (~2 hrs incl. verification) · **Impact:** High (the two jobs that gate a native-code release do not currently depend on the native code)

---

## TL;DR

`turbo.json` declares `inputs` for `build:ios` and `build:android` that read as
repo-root paths — `ios`, `android`, `src/*.ts`, `package.json`, `*.podspec`.
Turborepo resolves `inputs` **relative to the package that owns the task**, and
both tasks are scripts in `example/package.json`. So every glob resolves against
`example/`, and the library's own sources are never hashed.

Measured, not inferred: both tasks hash **the same 10 files**, all of them the
example app's screens plus its `package.json`. Zero files from `ios/`,
`android/`, the library's `src/`, or `ObjectCapture.podspec`.

The consequence is that a cache hit or miss is **uncorrelated with whether
native code changed**. A PR that edits `ios/*.mm` or the podspec can replay a
cached green `build-ios` without Xcode ever running.

---

## What exists today

Verified against `origin/main` at `46b8aa8` on 2026-09-03.

`turbo.json` declares:

```json
"build:ios": {
  "inputs": [
    "package.json", "*.podspec", "ios", "src/*.ts", "src/*.tsx",
    "example/package.json", "example/ios",
    "!example/ios/build", "!example/ios/Pods"
  ]
}
```

`build:ios` and `build:android` are scripts in `example/package.json`, so turbo
reports `package: react-native-object-capture-example`, `directory: example`.
Each glob therefore resolves one level down:

| Declared input | Resolves to | Result |
|---|---|---|
| `package.json` | `example/package.json` | hashed — but this is **not** the root manifest |
| `src/*.ts` / `src/*.tsx` | `example/src/*` | hashed — the example's screens, not the library |
| `ios` | `example/ios` | **not hashed** — bare dir name does not glob recursively |
| `android` | `example/android` | **not hashed** — same |
| `*.podspec` | `example/*.podspec` | **missing** — no such file |
| `example/package.json` | `example/example/package.json` | **missing** |
| `example/ios` | `example/example/ios` | **missing** |

### Measured input set

`yarn turbo run build:ios --dry=json` reports hash `685098d6971ee16c` over
exactly 10 files:

```
package.json
src/App.tsx
src/HomeScreen.tsx
src/ModelOutputListScreen.tsx
src/ModelOutputScreen.tsx
src/ObjectSessionHelpModal.tsx
src/ObjectSessionScreen.tsx
src/PhotogrammetrySessionScreen.tsx
src/ScanPassStageModal.tsx
src/permissions.ts
```

`build:android` hashes the **identical 10 files** (hash `1dc7266eb98b93cc`).

Not covered, by file count: `ios/` (31 files), `android/` (14),
`example/ios/` (51,477), `example/android/` (132), `ObjectCapture.podspec`,
and the root `package.json`.

That local hash `685098d6971ee16c` is the same value CI logged as
`cache hit, replaying logs 685098d6971ee16c` on the release PR, which confirms
the local measurement is the computation CI performs.

## Why this went unnoticed

The failure is silent in both directions and looks like normal cache behaviour:

- **PR #37** changed `android/gradle.properties` — a library file, not in the
  input set. Its `build-android` logged `cache miss, executing
  1dc7266eb98b93cc` and did a real 5m18s Gradle build, so the Kotlin bump *was*
  genuinely verified. That was a **cold cache**, not the input set working. The
  same commit would hit the cache today.
- **Release PR #26** changed the root `package.json` (`0.2.6` → `0.2.7`), which
  is a *declared* input, and still hit the cache — because the declared
  `package.json` is `example/package.json`, which did not change.

So the jobs pass, the durations look plausible, and nothing in the log says the
key is wrong. `ci.yml` is not at fault — its `turbo_cache_hit` guard is a
correct optimisation over an incorrect key.

## Why it matters here specifically

`release.yml` deliberately does **not** re-run the native builds before
publishing, and says so:

> Pre-publish safety gate — the fast checks only. The heavy iOS/Android builds
> already ran on the PR; re-running them here would just duplicate a green
> result.

That reasoning is sound, but it rests on the PR build having actually built. For
an iOS-only library whose entire value is native, `build-ios` is the gate that
matters, and it is currently keyed on nine TSX screens in the example app.

## What to change

Two candidate fixes; prefer the second.

1. **Correct the globs** — prefix root paths with `../` and make directory
   inputs recursive (`../ios/**`, `../android/**`, `../ObjectCapture.podspec`,
   `../package.json`, `ios/**` for the example's own project). Works, but
   `../` escapes the package boundary and is awkward to keep right.

2. **Add `dependsOn`** so the library package's hash propagates into the
   example's task hash, and let each package declare its own inputs. This is the
   idiomatic Turborepo answer and does not depend on relative-path bookkeeping.

Either way the example's own `ios/`/`android/` directories need recursive globs,
since the bare directory names currently match nothing.

## How to verify (do not skip — this is the whole point)

The fix is only real if a native-only edit misses the cache:

1. Record the baseline: `yarn turbo run build:ios --dry=json | ... .hash`
2. Touch a library native file — e.g. add a comment to a file in `ios/`
3. Re-run the dry run. **The hash must change.**
4. Repeat for `ObjectCapture.podspec`, the root `package.json`, and a file in
   `example/ios/`
5. Repeat all of the above for `build:android` against `android/`

A fix that does not move the hash in step 3 has not fixed anything.

## Sequencing

Independent of the other two open plans; touches only `turbo.json`. Best done
**after** 0.2.7 publishes, since correcting the key will force a full cold
iOS build on the next PR (~20 min) and there is no reason to absorb that
mid-release.

## Codeable vs. owner

Fully codeable. The one judgement call — whether to accept slower CI in exchange
for builds that actually verify native changes — has only one defensible answer
for a published native library, so it does not need to come back to the owner.
