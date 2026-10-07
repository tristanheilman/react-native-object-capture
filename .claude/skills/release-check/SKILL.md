---
name: release-check
description: Review the open release-please Release PR before the maintainer merges it, and confirm the npm publish afterwards. Invoke as /release-check when a "chore(main): release x.y.z" PR is open or was just merged.
disable-model-invocation: true
---

# Release check

Merging the Release PR tags the version, creates the GitHub release and
publishes to npm with provenance. Your job is to make sure the maintainer knows
exactly what they're publishing, then confirm it landed. **The merge itself is
the maintainer's call — never merge it for them.**

## Before merge

1. Find it: `gh pr list --search "chore(main): release" --state open`.
2. Explain what it is if asked: it only changes `package.json`,
   `CHANGELOG.md` and `.release-please-manifest.json`. The code it lists is
   already on `main`; merging is the switch that releases it. Closing it
   doesn't revert anything — it just delays the release until the next one.
3. Read the changelog (`gh pr view <N> --json body --jq .body`) and check each
   line against what actually merged since the last tag
   (`git log v<last>..origin/main --oneline`):
   - **Internal noise** — e.g. a `fix(ci):` line means nothing to library
     users. To drop or reword one, edit the *merged* PR's description to add:
     ```
     BEGIN_COMMIT_OVERRIDE
     chore(ci): <same subject>
     END_COMMIT_OVERRIDE
     ```
     release-please regenerates the Release PR on its next run.
   - **Collapsed lines** — a multi-commit PR that was squash-merged shows as
     one line. The same override block can list several `fix(...)` lines.
   - **Version** — a patch for fixes, minor for `feat`. Breaking behaviour
     (a call that used to succeed now rejects) deserves a mention even in a
     patch.
4. "No checks reported" is expected: the PR is opened with the
   `GITHUB_TOKEN`, which doesn't trigger workflows. If a bot-triggered run
   shows `action_required` or fails with zero jobs, nothing was built — not a
   code failure. The release workflow re-runs the fast checks before publishing.
5. Device-verified fixes vs compile-only ones: say which is which, so the
   maintainer knows what has actually run on hardware.

Then give the command: approve the PR (it's bot-authored, so the maintainer can
approve it normally) and `! gh pr merge <N> --squash`.

## After merge

1. Watch the release workflow: `gh run list --workflow Release --limit 2`.
2. Check the publish step's log for `+ react-native-object-capture@<version>`
   and the provenance line (`Provenance statement published to transparency log`).
3. npm can take several minutes after a successful publish before `latest`
   moves. Poll the registry directly rather than trusting a cache:
   ```sh
   curl -s https://registry.npmjs.org/react-native-object-capture \
     | python3 -c "import sys,json;print(json.load(sys.stdin)['dist-tags'])"
   ```
   Run the poll in the background and report when it flips; don't call it done
   before then.
4. Add a line to `docs/agent/log.md` noting the version and what shipped.
