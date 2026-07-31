#!/usr/bin/env bash
#
# Generates human-readable GitHub Release notes with Claude and writes them to
# the release created by release-please. Best-effort: if anything fails, the
# release keeps release-please's conventional-commit notes (the caller runs this
# with continue-on-error).
#
# Env: ANTHROPIC_API_KEY, RELEASE_TAG, GH_TOKEN, GITHUB_REPOSITORY (auto).
set -euo pipefail

: "${ANTHROPIC_API_KEY:?ANTHROPIC_API_KEY is required}"
: "${RELEASE_TAG:?RELEASE_TAG is required}"

# Commit range since the previous tag (fall back to the last 50 commits on the
# first release, when there is no earlier tag to diff against).
PREV_TAG="$(git describe --tags --abbrev=0 "${RELEASE_TAG}^" 2>/dev/null || true)"
if [ -n "$PREV_TAG" ]; then
  LOG="$(git log "${PREV_TAG}..${RELEASE_TAG}" --no-merges --pretty=format:'- %s (%h)')"
else
  LOG="$(git log "${RELEASE_TAG}" -n 50 --no-merges --pretty=format:'- %s (%h)')"
fi

if [ -z "$LOG" ]; then
  echo "No commits in range; leaving release-please notes as-is."
  exit 0
fi

PROMPT="You are writing the GitHub Release notes for the npm package \`${GITHUB_REPOSITORY}\` version \`${RELEASE_TAG}\`.

Below is the commit log since the previous release, in Conventional Commits format. Write concise, friendly, well-structured Markdown release notes:
- Open with a one- or two-sentence plain-language summary of what changed in this release.
- Then group the changes under headings that apply (## Features, ## Fixes, ## Documentation, ## Internal). Omit any heading with no entries.
- Rewrite each commit as a short, human-readable bullet — describe the user-facing effect, not the raw commit subject. Merge trivial/duplicate commits.
- Do not invent changes that aren't in the log. Do not include a raw commit list or hashes.
- Keep it tight; this is a pre-1.0 library.

Commit log:

${LOG}"

REQUEST="$(jq -n --arg m "$PROMPT" \
  '{model: "claude-opus-4-8", max_tokens: 2000, messages: [{role: "user", content: $m}]}')"

RESPONSE="$(curl -sS --fail-with-body https://api.anthropic.com/v1/messages \
  -H "x-api-key: ${ANTHROPIC_API_KEY}" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "$REQUEST")" || { echo "Anthropic API call failed:"; echo "$RESPONSE"; exit 1; }

NOTES="$(printf '%s' "$RESPONSE" | jq -r '[.content[]? | select(.type == "text") | .text] | join("")')"

if [ -z "$NOTES" ] || [ "$NOTES" = "null" ]; then
  echo "Claude returned no text; leaving release-please notes as-is. Raw response:"
  printf '%s\n' "$RESPONSE"
  exit 0
fi

printf '%s\n' "$NOTES" > "${RUNNER_TEMP:-/tmp}/ai-release-notes.md"
gh release edit "$RELEASE_TAG" --notes-file "${RUNNER_TEMP:-/tmp}/ai-release-notes.md"
echo "Updated ${RELEASE_TAG} release notes with Claude-generated content."
