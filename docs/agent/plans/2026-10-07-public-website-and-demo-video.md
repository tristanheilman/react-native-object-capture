# Public website and demo video

**Date:** 2026-10-07
**Status:** approved design — implementation next. Pages enabled (Actions); Cloudflare site created.
**Tracks:** [#28](https://github.com/tristanheilman/react-native-object-capture/issues/28) (README demo) and the new public site
**Type:** codeable, plus three owner actions (listed at the end)

---

## Intent

**Audience:** React Native developers deciding whether to adopt the library.
**Success:** they see a real scan and a real measurement within seconds, and
reach `yarn add` without friction. Installs and stars are the measure.

What sells this library is that the model is **measured, not guessed**: a
true-scale USDZ whose dimensions match a tape measure. Every asset below
should lead to that.

## 1. Demo video (cut from two screen recordings)

**Sources** (in `~/Downloads`, never committed):
- `ScreenRecording_10-07-2026 18-43-51_1.MP4` (3m48s): detection, two capture
  passes, and pass reviews. Its *ending* shows pre-#50 dimensions
  (44.5 × 22.2 × 28.9 cm), which are wrong, so everything from "Build model"
  onward is cut.
- `ScreenRecording_10-07-2026 20-40-56_1.MP4` (1m02s): recorded on the fixed
  build. Pass complete → build progress → **Model ready 23.5 × 12.7 × 13.8 cm**
  → cm/in toggle (9.3 × 5.0 × 5.4 in) → model rotating in the viewer.

**Edit:**
- Crop the iOS status bar from every frame. It's clutter, and it can show
  which app was used last.
- Capture: speed up 3–4× so the passes read as motion, not waiting. Keep
  detection and the "Pass N complete" reviews at a readable speed.
- Build progress: speed up heavily, about 2 seconds total.
- "Model ready" with the size tiles and the cm → in toggle: real time, held
  long enough to read. This is the payoff shot.
- End on the rotating model.
- Strip the audio.

**Outputs:**

| File | For | Spec | Budget |
|---|---|---|---|
| `website/media/demo.mp4` | Site hero | H.264, ~540 px wide, ~40–50 s, muted, faststart | ≤ 6 MB |
| `website/media/demo-poster.jpg` | Site hero poster | The Model-ready frame | ≤ 150 KB |
| `docs/media/demo.gif` | README (#28) | ~15 s highlight, 320 px wide, ~12 fps | ≤ 5 MB |

Assets are committed once and stay in git history permanently, so keep them
within budget. Re-encode rather than re-commit when iterating.

## 2. Website: a single landing page (Approach A)

Chosen over Docusaurus/Starlight. The README stays the one home for the docs,
so the two can't drift apart. Moving to a docs framework later stays possible,
and the media and copy carry over.

**Location:** `website/` (plain HTML + CSS, no build step, no new
dependencies; not a Yarn workspace).

**Sections:**
1. **Hero:** headline (*Scan a real object. Get a true-scale 3D model.*),
   the video (muted autoplay loop, `playsinline`, poster; no autoplay under
   `prefers-reduced-motion`), the copyable `yarn add react-native-object-capture`,
   and GitHub and npm buttons.
2. **Measured, not guessed:** the tissue box. Tape measure ~22 × 11 × 12.5 cm vs
   model 23.5 × 12.7 × 13.8 cm (the reading shown in the demo video), with the note that the extra height is tissue
   poking out of the top. Real numbers from #50's device verification.
3. **How it works:** detect → capture passes → on-device reconstruction →
   USDZ + dimensions.
4. **Requirements:** iPhone 12 Pro or newer (LiDAR), iOS 17+, React Native
   0.79+ with the New Architecture, plus the Expo config plugin. Stated once,
   matching the README. If one changes, both change in the same commit.
5. **Quick start:** the README's minimal example, then a link to the README's
   API reference.
6. **Footer:** license, GitHub, npm, and a one-line analytics notice.

**Look:** the example app's theme (`#0B0B0F` background, `#4F8CFF` accent,
system font stack), so the site and the demo look like one product. Works at
phone width with no horizontal scroll.

**Deploy:** `.github/workflows/pages.yml`, on push to `main` touching
`website/**`, plus manual dispatch. Uses `actions/upload-pages-artifact` +
`actions/deploy-pages`. It's separate from `ci.yml`, whose no-push-trigger
choice stays as it is.
URL: `https://tristanheilman.github.io/react-native-object-capture/`.

**Analytics:** Cloudflare Web Analytics beacon (cookieless, so no consent
banner). It works on GitHub Pages without moving DNS. The site token is public
by design (it ships in page source) and lives in `website/index.html`:
`3968fcefe556444d804d5a7812cb5f7f`. Use Cloudflare's snippet as issued
(`type='module'`).

**Links:** `package.json` `homepage` → the site, which reaches npm on the next
release. The repo's "Website" field gets the same URL.

## 3. README (#28)

The GIF near the top, under the badges, with alt text, linking to the site.
Closes #28.

## Verification

- Video: frame-check the cut (no pre-fix dimensions, no status bar), and
  confirm sizes are within budget (`ffprobe`, `ls -l`).
- Site: serve locally (`python3 -m http.server -d website`) and screenshot it
  at phone and desktop widths. Check video autoplay, the reduced-motion
  fallback, and copy-to-clipboard.
- After deploy: load the live URL, and confirm the beacon reports in
  Cloudflare.

## Out of scope (deliberately)

Docs pages, custom domain, blog, versioned docs, a second demo object.

## Owner actions

1. **Enable Pages:** repo Settings → Pages → Source: **GitHub Actions**.
2. **Cloudflare:** dashboard → Web Analytics → Add a site → hostname
   `tristanheilman.github.io` → copy the JS snippet's `token`.
3. **Merge** the PRs (and later the release that carries the `homepage` link).
