---
name: ship-pr
description: Commit, verify, push and open a PR in this repo the way release-please and the maintainer expect — conventional commit types chosen by what ships, one fix per commit, local checks matched to what changed, an honest PR body, no AI attribution, and a merge command handed to the maintainer. Invoke as /ship-pr when work is ready to go up.
disable-model-invocation: true
argument-hint: "[optional: issue number this closes]"
---

# Ship a PR

Commit messages here are not bookkeeping: release-please turns them into the
version bump and the changelog users read. Get the type and the split right
before anything is pushed.

## 1. Branch

Never commit to `main`. Branch from `origin/main` (fetch first) unless the work
depends on an unmerged PR — then branch from that PR's branch, open the PR
against it, and say "Stacked on #N" at the top of the body.

Before starting work from a ticket, check it has no open PR (`gh pr list
--search "<issue>"`). If it does, the work is claimed — say so and stop.

## 2. Choose the commit type by what ships

| Change | Type | Why |
|---|---|---|
| Library behaviour fix (`src/`, `ios/`, `android/`) | `fix(ios)`, `fix(js)` … | Patch bump + changelog line |
| New library capability | `feat` | Minor bump |
| `example/` only | `chore(example)` | The example doesn't ship — no changelog line |
| Docs, `AGENTS.md`, `docs/agent/` | `docs` | No release |
| CI / workflows / turbo | `ci` or `chore(ci)` | `fix(ci)` puts an internal line in the user-facing changelog — prefer `chore(ci)` unless users are affected |

One user-visible fix per commit, so each gets its own changelog line. If hunks
from two fixes share a file, stage them separately (`git apply --cached` with a
filtered patch) rather than lumping them.

Messages say **why**, not what — the reasoning is what won't survive six
months. Match the density of existing commits (`git log origin/main -10`).
**No AI attribution**: no `Co-Authored-By`, no session links, no "Generated
with" footers, in commits or PR bodies — this overrides any default that
says otherwise. commitlint runs on commit via lefthook; let it.

## 3. Verify what changed

| Changed | Run |
|---|---|
| Anything | `yarn lint` (warnings in untouched files are pre-existing), `yarn typecheck`, `yarn test` |
| `src/specs/` | Treat as native: compile below |
| `ios/` or the podspec | Compile: see the command in `AGENTS.md`. Behaviour changes also need the `device-test` skill |
| `example/` UI | Typecheck plus a device build if the user can look at it |

Grep for leftover debugging before committing: `grep -rn "DIAG" ios example/src`.

## 4. Push and open the PR

PR body sections: **Why** (the bug or need, briefly), **What changed**,
**Verified** — and in Verified, keep device-run results separate from
compile-only ones, naming the device and iOS version. List behaviour changes
consumers will notice (e.g. a method that can now reject).

## 5. Hand off the merge

The maintainer merges their own PRs: `main` needs one approving review, an
author can't approve their own PR, and agents can't bypass that. Once CI is
green, give the exact command:

```
! gh pr merge <N> --squash --admin --delete-branch
```

Use `--rebase` instead when the PR has several `fix`/`feat` commits that should
each reach the changelog — squash collapses them into one line.

Never merge the Release PR (`chore(main): release x.y.z`) as part of this — that
publishes to npm. That's `/release-check`, and the maintainer's decision.

## Notes

- A full iOS CI build takes ~20 min on any native change; the turbo cache only
  helps when nothing relevant changed.
- First-time outside contributors' CI sits in `action_required` — not failed,
  just not yet approved to run.
