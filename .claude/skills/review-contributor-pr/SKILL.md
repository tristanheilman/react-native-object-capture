---
name: review-contributor-pr
description: Review an outside contributor's pull request to this library — confirm what it claims by reproducing it against a packed tarball (and a real `expo prebuild` for config-plugin changes), check CI state correctly, and draft a review for the maintainer to post. Use whenever the user asks to review, check, look at or merge a PR from someone other than the maintainer, or mentions a contributor by name or a PR number from a fork.
---

# Review a contributor PR

This repo takes real outside contributions, and a merged PR lands in other
people's builds via npm. Review by reproducing, not by reading: the bugs that
matter here (a plugin silently overwriting a consumer's Info.plist strings, a
native path that only breaks on device) don't show in a diff.

## 1. Context first

- `gh pr view <N> --json title,author,body,files,commits,headRepository`
- Which issue does it address? Is anyone else's PR already on it? If two PRs
  compete, flag it to the maintainer rather than choosing.
- Read `AGENTS.md` for repo rules the PR might cross: Android is
  deliberately unimplemented (not an unfinished port), both native paths
  (Fabric and legacy) must keep working, and `src/specs/` edits are native
  changes.

## 2. CI state, read correctly

- `action_required` on a first-time contributor's run means GitHub is waiting
  for the maintainer to approve running it. It hasn't failed; it hasn't run.
  Tell the maintainer, don't treat it as a red check.
- Green CI means it compiles. It doesn't mean it works: CI never runs Object
  Capture. Behaviour changes in `ios/` need the `device-test` skill.

## 3. Reproduce

Test it the way a consumer would get it — from a packed tarball, not the
workspace link:

```sh
gh pr checkout <N>
yarn install && yarn prepare && npm pack      # produces react-native-object-capture-x.y.z.tgz
```

- **Config plugin (`app.plugin.js`) changes:** create a throwaway Expo app in
  the scratchpad, install the tarball, add the plugin to `app.json`, run
  `npx expo prebuild --platform ios --clean`, and inspect the generated
  `Info.plist`. Test the cases that bite: the consumer already set the key
  (must be preserved — the first-party pattern is `prop || existing || default`,
  not `prop ?? default`), the plugin listed before and after other plugins
  that touch the same keys (mods run last-added-first).
- **JS/TS changes:** `yarn lint && yarn typecheck && yarn test`, plus a quick
  consumer-style import from the tarball if exports changed.
- **Native changes:** compile (see `AGENTS.md`), then device-test anything
  behavioural.

## 4. Draft the review

Write it for the contributor: what's good, then each problem with the
evidence (command, output, file and line), and a concrete fix. Keep the
reasoning visible — they can't see your reproduction.

**Draft it; don't post it.** Give the maintainer the text and the
recommendation (approve / request changes) — posting and merging are theirs.
Note for the maintainer: `dismiss_stale_reviews_on_push` and
`require_last_push_approval` are on, so the contributor's fix push clears an
earlier approval.

## 5. When it's merge-ready

The maintainer can approve outside PRs normally. Suggest the merge method by
what the changelog should show: squash when the PR's internal commits shouldn't
each become a line (e.g. a `fix:` for a bug that never shipped).
