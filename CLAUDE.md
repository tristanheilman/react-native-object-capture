@AGENTS.md

## Claude Code specifics

Project skills in `.claude/skills/`:

- `device-test` — build the example to a connected LiDAR iPhone and stream its
  console; also a compile-only mode when no phone is attached.
- `review-contributor-pr` — review an outside PR: claimed-ticket check,
  reproduce from a packed tarball, draft (don't post) the review.
- `/ship-pr` — conventional commits, pre-push checks, PR body, merge handoff.
  User-invoked only.
- `/release-check` — review the Release PR's changelog and confirm the npm
  publish after merge. User-invoked only.
