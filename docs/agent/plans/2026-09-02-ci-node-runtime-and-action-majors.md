# Move CI off the Node 20 action runtime — bump action majors, and decide separately what `.nvmrc` should pin

**Date:** 2026-09-02
**Status:** done — [#55](https://github.com/tristanheilman/react-native-object-capture/pull/55), 2026-10-08. `.nvmrc` still open, see Out of scope.
**Tracks:** [#41](https://github.com/tristanheilman/react-native-object-capture/issues/41)
**Type:** CI maintenance (fully codeable, no owner action, no device)
**Effort:** Low (~1 hr) · **Impact:** Medium (removes a live deprecation that GitHub is currently papering over; no user-facing change)

---

## TL;DR

Every CI job in this repo emits a GitHub warning that the actions it pins target
a deprecated JavaScript runtime, and that GitHub is **overriding the pin** to
keep them working. The version in the workflow file no longer describes what
executes. Bump the four action majors that trigger it.

There is a **second, separate** Node question underneath — `.nvmrc` pins
`v20.19.0`, which is the Node that runs `yarn`, `jest` and `tsc`. That is a
different axis from the action runtime, it carries real risk the action bump
does not, and it should be decided on its own rather than swept into the same
change. This plan does the first and scopes the second.

---

## What exists today

Verified against `origin/main` at `08c1c83` on 2026-09-02.

**Action pins, by file:**

| File | Actions pinned |
|---|---|
| `.github/workflows/ci.yml` | `actions/checkout@v4` (×5 jobs), `actions/cache@v4`, `actions/cache/restore@v4`, `actions/cache/save@v4`, `actions/setup-java@v4`, `maxim-lobanov/setup-xcode@v1` |
| `.github/workflows/release.yml` | `actions/checkout@v4`, `actions/setup-node@v4`, `googleapis/release-please-action@v4` |
| `.github/actions/setup/action.yml` | `actions/setup-node@v4`, `actions/cache/restore@v4`, `actions/cache/save@v4` |

The composite `setup` action is where most of it concentrates — fixing it once
covers every job that calls it, which is all five.

**Current majors** (checked 2026-09-02 via the GitHub releases API):

| Action | Pinned | Latest |
|---|---|---|
| `actions/checkout` | v4 | **v7.0.1** (2026-07-20) |
| `actions/setup-node` | v4 | **v7.0.0** (2026-07-14) |
| `actions/cache` | v4 | check at execution time |
| `actions/setup-java` | v4 | check at execution time |
| `maxim-lobanov/setup-xcode` | v1 | v1.7.0 (2026-03-18) — v1 is still current, no action needed |

## Why it matters

This is not speculative. The most recent green `CI` run — `31796034704`
(2026-08-14, branch `docs/android-targetsdk-nuance`) — emits the warning in
**all five jobs** (`lint`, `test`, `build-library`, `build-android`, `build-ios`):

> `##[warning]Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/cache/restore@v4, actions/checkout@v4, actions/setup-node@v4`

with `actions/cache@v4` additionally named in `build-android`.

`actions/setup-java@v4` also triggers it, but only on runs where the Turborepo
cache **misses** — the JDK install is gated on `if: env.turbo_cache_hit != 1`.
It appears in run `30867248328` (2026-08-04) and not in `31796034704`. Don't
conclude it is clean from one green run; it is conditional, not absent.

The operative phrase is **"being forced to run on Node.js 24"**. GitHub is
already not honouring the pin. Two consequences:

1. **The pin is decorative.** These actions are running on a runtime they were
   not tested against, chosen by GitHub, and that will keep moving. The green
   check is currently carried by a compatibility shim.
2. **Withdrawal breaks CI at the worst moment** — on someone else's PR, in a
   repo that takes outside contributions, where a red check on unrelated work is
   exactly the friction that loses a contributor. There are three external PRs
   open right now.

Cheap to fix while nothing depends on it. Annoying to fix under a red build.

## Evidence & sources (verified 2026-09-02)

- **In-repo:** CI run [`31796034704`](https://github.com/tristanheilman/react-native-object-capture/actions/runs/31796034704) (2026-08-14, latest green `CI`) — warning present in all five jobs. Also run [`30867248328`](https://github.com/tristanheilman/react-native-object-capture/actions/runs/30867248328) (2026-08-04), which additionally names `actions/setup-java@v4` on a Turborepo cache miss.
- **GitHub's deprecation notice:** [Deprecation of Node 20 on GitHub Actions runners](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)
- **Node.js release schedule** ([endoflife.date/nodejs](https://endoflife.date/nodejs), checked 2026-09-02): Node **20** active support ended **2026-04-30**, security support runs to **2027-04-30** — in maintenance, *not* end-of-life. Node **22** likewise in maintenance. Node **24** is the only Active LTS (active until 2026-10-20, security to 2028-04-30).
- **Latest action majors:** GitHub releases API for each repo above.

## Concrete recommendation (step by step)

1. **`.github/actions/setup/action.yml`** — bump `actions/setup-node@v4` → v7,
   and `actions/cache/restore@v4` + `actions/cache/save@v4` to the current major.
   Keep `node-version-file: .nvmrc`; do **not** hardcode a version here, that
   indirection is deliberate.
2. **`.github/workflows/ci.yml`** — `actions/checkout@v4` → v7 in all five jobs;
   `actions/cache@v4` and `actions/setup-java@v4` to current majors. Leave
   `maxim-lobanov/setup-xcode@v1` alone unless v1 has been superseded.
3. **`.github/workflows/release.yml`** — `actions/checkout@v4` → v7,
   `actions/setup-node@v4` → v7. Leave `googleapis/release-please-action@v4`
   alone — its v4 is the current major and unrelated to the runtime warning.
4. **Read each major's release notes before bumping.** These are major bumps, not
   patches. `actions/cache` in particular has changed backend behaviour across
   majors; a silent cache-key or restore change would show up as mysteriously
   slower builds, not as a failure.
5. **Verify by absence.** Open the PR and confirm a full CI run completes with
   **zero** `Node.js 20 is deprecated` lines. That is the whole acceptance test.

### Explicitly out of scope

`.nvmrc` pinning `v20.19.0` is a **different problem** and should not ride along:

- It sets the Node that runs `yarn`, `jest`, `tsc` and `bob build` — the toolchain
  that produces `lib/`, i.e. what ships to npm.
- Node 20 is in maintenance until 2027-04-30, so there is no urgency, but
  `20.19.0` is also behind the current `20.20.2` within its own line.
- Moving it to 22 or 24 is a real change with real risk: it can shift `bob build`
  output and Jest behaviour, and it is the runtime for `npm publish --provenance`.
  It deserves its own PR, its own green matrix, and a deliberate check that the
  built `lib/` is unchanged.

Bundling the two would mean a mysterious build difference could not be
attributed to either. Keep them separate.

## Effort / impact

- **Effort:** Low, ~1 hr. Mechanical version bumps across three files, plus
  reading release notes. No source changes, no native code, no device.
- **Impact:** Medium. Nothing user-facing — the package output is untouched. The
  value is removing a live warning that is currently masking a runtime the repo
  did not choose, and doing it before it becomes someone else's red PR.

## Codeable vs. owner

**Fully codeable — no owner action, no device.** Bumps and a CI run.

One judgment call to surface rather than decide silently: if any of these majors
turns out to have breaking behavioural changes (most likely `actions/cache`),
stop and flag it rather than working around it. A cache that silently stops
hitting turns a ~20-minute iOS build into a per-PR cost.

## Acceptance criteria (verifiable)

- [ ] A full CI run on the PR completes with **zero** occurrences of `Node.js 20 is deprecated` across all five jobs
- [ ] `actions/checkout` and `actions/setup-node` are on current majors in `ci.yml`, `release.yml`, and `.github/actions/setup/action.yml`
- [ ] `actions/cache`, `actions/cache/restore`, `actions/cache/save`, `actions/setup-java` audited and bumped or explicitly justified as already current
- [ ] Turborepo and CocoaPods cache steps still report hits on a second run — the bump did not silently invalidate cache keys
- [ ] `.nvmrc` is **unchanged** by this PR
- [ ] `release.yml` still produces a release-please PR after merge (verify the workflow runs green on `main`; do **not** merge the Release PR to test it)
