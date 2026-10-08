# Public Website and Demo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a demo video cut, a single-page public site on GitHub Pages with Cloudflare Web Analytics, and the README demo GIF (#28).

**Architecture:** A reproducible ffmpeg script turns two screen recordings into three committed assets. A static `website/` (HTML + CSS + a few lines of inline JS, no build step) is deployed by a dedicated Pages workflow on pushes to `main` that touch `website/**`. The README embeds the GIF and links to the site.

**Tech Stack:** ffmpeg/ffprobe (Homebrew), plain HTML/CSS, GitHub Actions (`actions/configure-pages`, `upload-pages-artifact`, `deploy-pages`), Cloudflare Web Analytics.

**Spec:** `docs/agent/plans/2026-10-07-public-website-and-demo-video.md`

## Global Constraints

- Audience: React Native developers evaluating the library. Lead with the real scan and the real measurement.
- Never show pre-#50 dimensions (44.5 × 22.2 × 28.9 cm). Status bar cropped from every frame. No audio.
- Budgets: `website/media/demo.mp4` ≤ 6 MB, `website/media/demo-poster.jpg` ≤ 150 KB, `docs/media/demo.gif` ≤ 5 MB.
- Site URL `https://tristanheilman.github.io/react-native-object-capture/`. It's served under a sub-path, so **all asset links are relative** (`media/demo.mp4`, never `/media/demo.mp4`).
- Theme: background `#0B0B0F`, surface `#16161D`, text `#F5F5F7`, secondary `#A1A1AA`, accent `#4F8CFF`. System font stack.
- Requirements copy, matching README exactly: iPhone 12 Pro or newer (LiDAR) · iOS 17+ · React Native 0.79+ with the New Architecture.
- Measurement copy (from #50 device verification): tape ~22 × 11 × 11 cm; model 23.1 × 12.5 × 13.2 cm.
- Cloudflare snippet, as issued (no `integrity` attribute: Cloudflare updates `beacon.min.js` in place without versioning, so a pinned SRI hash would silently break analytics on their next update): `<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3968fcefe556444d804d5a7812cb5f7f"}'></script>`
- No new npm dependencies; `website/` is not a Yarn workspace. No AI attribution in commits or PR bodies.
- Commit types: assets/site/workflow are `docs:`; the `package.json` homepage change is `chore:`.

## Review Focus

1. **Reduced motion:** a visitor with `prefers-reduced-motion: reduce` must not get autoplaying video; they see the poster and can press play.
2. **Phone width:** at 375 px wide, nothing scrolls horizontally. The code block and install command wrap or scroll inside their own box.
3. **Video fails or loads slowly:** the poster shows immediately and the layout doesn't jump, because the video's aspect ratio is reserved.
4. **Copy button without the Clipboard API** (insecure context, older browser): it still selects the command text, and never throws.
5. **Sub-path hosting:** every asset and link resolves under `/react-native-object-capture/`; an absolute `/…` path would 404 only after deploy.

---

## File Structure

| Path | Responsibility |
|---|---|
| `website/scripts/make-demo.sh` | Reproducible cut: sources in, three assets out, budget check |
| `website/media/demo.mp4`, `demo-poster.jpg` | Site hero assets |
| `docs/media/demo.gif` | README demo |
| `website/index.html` | Page markup, inline copy-button JS, Cloudflare beacon |
| `website/style.css` | All styling |
| `.github/workflows/pages.yml` | Deploy `website/` to GitHub Pages |
| `README.md` | GIF + site link near the top |
| `package.json` | `homepage` → site URL |

---

### Task 1: Demo video cut

**Files:**
- Create: `website/scripts/make-demo.sh`
- Create (generated): `website/media/demo.mp4`, `website/media/demo-poster.jpg`, `docs/media/demo.gif`

**Interfaces:**
- Produces: `media/demo.mp4` and `media/demo-poster.jpg` (relative to `website/`), plus `docs/media/demo.gif`. Task 2 references the first two by those relative paths; Task 4 references the GIF.

- [ ] **Step 1: Find the status-bar height and cut points.** Extract frames at 1 fps from each source to a scratch dir, and contact-sheet them:

```bash
SRC_A="$HOME/Downloads/ScreenRecording_10-07-2026 18-43-51_1.MP4"
SRC_B="$HOME/Downloads/ScreenRecording_10-07-2026 20-40-56_1.MP4"
OUT=$TMPDIR/demo-frames; mkdir -p $OUT
ffmpeg -v error -i "$SRC_A" -vf "fps=1,scale=220:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontcolor=yellow:fontsize=14,tile=10x6" $OUT/a-%02d.jpg
ffmpeg -v error -i "$SRC_B" -vf "fps=1,scale=220:-1,drawtext=text='%{pts\:hms}':x=4:y=4:fontcolor=yellow:fontsize=14,tile=10x7" $OUT/b-%02d.jpg
```

View the sheets and record exact second marks for each segment:
- From A: detection box shown (start); capture pass 1 (start/end); "Pass 1 complete" review; pass 2; "Pass 2 complete" review. **End A before "Build model".**
- From B: build progress start/end; "Model ready" first frame; the cm → in toggle; viewer start through rotation end.
- Status bar: from a full-res frame (`ffmpeg -ss 5 -i "$SRC_A" -frames:v 1 $OUT/full.png`), measure the pixel row where app content starts (the status bar plus Dynamic Island, about 120–140 px of 2868). Use one crop height for both sources.

- [ ] **Step 2: Write `website/scripts/make-demo.sh`** with the measured values filled into the variables at the top:

```bash
#!/usr/bin/env bash
# Cut the demo from two screen recordings into the site and README assets.
# Sources stay outside the repo; only the outputs are committed, so re-run
# this rather than editing the outputs by hand.
#
# Usage: website/scripts/make-demo.sh <capture-recording> <ending-recording>
set -euo pipefail

SRC_A="$1"   # detection + capture passes (its own ending is pre-#50: cut before Build model)
SRC_B="$2"   # build + Model ready (correct size, cm/in toggle) + viewer
ROOT="$(git rev-parse --show-toplevel)"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT

CROP_TOP=130          # status bar + Dynamic Island, measured in step 1
W=540                 # output width; height follows the cropped aspect

# Segments: start end speed  (seconds in source; speed 1 = real time)
A_SEGMENTS=( "0 6 1"  "6 70 4"  "70 76 1"  "76 140 4"  "140 146 1" )
B_SEGMENTS=( "0 2 1"  "2 20 9"  "20 34 1"  "34 52 1" )

seg() { # src start end speed out
  ffmpeg -v error -ss "$2" -to "$3" -i "$1" -an \
    -vf "crop=in_w:in_h-${CROP_TOP}:0:${CROP_TOP},setpts=PTS/$4,fps=30,scale=${W}:-2" \
    -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p "$5"
}

n=0; : > "$WORK/list.txt"
for s in "${A_SEGMENTS[@]}"; do read -r a b sp <<<"$s"; seg "$SRC_A" "$a" "$b" "$sp" "$WORK/$n.mp4"; echo "file '$WORK/$n.mp4'" >> "$WORK/list.txt"; n=$((n+1)); done
for s in "${B_SEGMENTS[@]}"; do read -r a b sp <<<"$s"; seg "$SRC_B" "$a" "$b" "$sp" "$WORK/$n.mp4"; echo "file '$WORK/$n.mp4'" >> "$WORK/list.txt"; n=$((n+1)); done

mkdir -p "$ROOT/website/media" "$ROOT/docs/media"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/list.txt" -c copy -movflags +faststart "$ROOT/website/media/demo.mp4"

# Poster: the Model-ready frame (the payoff), from the ending source.
POSTER_AT=26          # a second inside "Model ready", measured in step 1
ffmpeg -v error -y -ss "$POSTER_AT" -i "$SRC_B" -frames:v 1 \
  -vf "crop=in_w:in_h-${CROP_TOP}:0:${CROP_TOP},scale=${W}:-2" -q:v 6 "$ROOT/website/media/demo-poster.jpg"

# README GIF: a ~15 s highlight - one capture burst, then Model ready + toggle.
GIF_A=( 20 36 4 )     # start end speed in SRC_A, measured in step 1
GIF_B=( 20 30 1 )     # start end speed in SRC_B (Model ready + cm/in toggle)
seg "$SRC_A" "${GIF_A[@]}" "$WORK/g0.mp4"
seg "$SRC_B" "${GIF_B[@]}" "$WORK/g1.mp4"
printf "file '%s'\nfile '%s'\n" "$WORK/g0.mp4" "$WORK/g1.mp4" > "$WORK/gif.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/gif.txt" -c copy "$WORK/gif.mp4"
ffmpeg -v error -y -i "$WORK/gif.mp4" -vf "fps=12,scale=320:-2:flags=lanczos,palettegen=max_colors=96" "$WORK/pal.png"
ffmpeg -v error -y -i "$WORK/gif.mp4" -i "$WORK/pal.png" \
  -lavfi "fps=12,scale=320:-2:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4" "$ROOT/docs/media/demo.gif"

# Budgets - assets live in git history forever.
check() { local f=$1 max=$2; local sz; sz=$(stat -f%z "$f"); echo "$(basename "$f"): $((sz/1024)) KB (max $((max/1024)) KB)"; [ "$sz" -le "$max" ] || { echo "OVER BUDGET: $f" >&2; exit 1; }; }
check "$ROOT/website/media/demo.mp4"        $((6*1024*1024))
check "$ROOT/website/media/demo-poster.jpg" $((150*1024))
check "$ROOT/docs/media/demo.gif"           $((5*1024*1024))
```

The segment, poster and GIF numbers above are examples. Replace every one with the values measured in step 1.

- [ ] **Step 3: Run it and check the result**

```bash
chmod +x website/scripts/make-demo.sh
website/scripts/make-demo.sh "$SRC_A" "$SRC_B"
ffprobe -v error -show_entries format=duration -of csv=p=0 website/media/demo.mp4
```

Expected: three "KB (max …)" lines, no `OVER BUDGET`, and a duration of 40–50 s. If over budget: raise `-crf` by 2, or shorten the capture segments.

- [ ] **Step 4: Frame-check the cut.** Contact-sheet the output at 1 fps (as in step 1) and look at every frame:
  - no status bar or "◀ Claude";
  - no `44.5` anywhere;
  - "Model ready" shows 23.5 / 12.7 / 13.8 cm, then inches;
  - it ends on the rotating model.

  Do the same for the GIF (`ffmpeg -i docs/media/demo.gif -vf fps=2,tile=8x4 …`).

- [ ] **Step 5: Commit**

```bash
git add website/scripts/make-demo.sh website/media docs/media
git commit -m "docs: add the demo video and README GIF

Cut from two device recordings by a script so it can be re-run rather
than hand-edited. The capture recording's ending predates #50 and shows
the old capture-volume size, so the cut takes the build and Model-ready
shots from a second recording made on the fixed build."
```

---

### Task 2: Landing page

**Files:**
- Create: `website/index.html`, `website/style.css`

**Interfaces:**
- Consumes: `media/demo.mp4`, `media/demo-poster.jpg` (Task 1).
- Produces: a self-contained `website/` directory, deployed as-is by Task 3.

- [ ] **Step 1: Write `website/index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>react-native-object-capture — true-scale 3D scans in React Native</title>
  <meta name="description" content="A React Native library wrapping Apple's Object Capture: scan a real object on a LiDAR iPhone and get a dimensionally accurate USDZ model, reconstructed on device.">
  <meta property="og:title" content="react-native-object-capture">
  <meta property="og:description" content="Scan a real object. Get a true-scale 3D model.">
  <meta property="og:image" content="media/demo-poster.jpg">
  <meta name="theme-color" content="#0B0B0F">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="hero">
    <div class="hero-text">
      <p class="eyebrow">React Native · iOS · LiDAR</p>
      <h1>Scan a real object.<br>Get a true-scale 3D model.</h1>
      <p class="lede">A React Native wrapper for Apple's Object Capture. Guided capture, on-device reconstruction, and a USDZ whose dimensions match a tape measure.</p>
      <div class="install">
        <code id="install-cmd">yarn add react-native-object-capture</code>
        <button type="button" id="copy" aria-label="Copy install command">Copy</button>
      </div>
      <nav class="actions">
        <a class="button primary" href="https://github.com/tristanheilman/react-native-object-capture">GitHub</a>
        <a class="button" href="https://www.npmjs.com/package/react-native-object-capture">npm</a>
      </nav>
    </div>
    <div class="phone">
      <video id="demo" src="media/demo.mp4" poster="media/demo-poster.jpg"
             muted loop playsinline preload="metadata" controls
             aria-label="Demo: scanning a tissue box in two passes, building the model on device, and reading its measured size in centimetres and inches"></video>
    </div>
  </header>

  <main>
    <section class="measured">
      <h2>Measured, not guessed</h2>
      <p>Reconstruction bakes real-world scale into the model, and the library reports it. A tissue box, scanned on an iPhone 16 Pro Max:</p>
      <div class="compare">
        <div class="stat"><span class="label">Tape measure</span><span class="value">22 × 11 × 11 cm</span></div>
        <div class="stat accent"><span class="label">Model, from <code>onDimensions</code></span><span class="value">23.1 × 12.5 × 13.2 cm</span></div>
      </div>
      <p class="note">The extra height is tissue poking out of the top.</p>
    </section>

    <section class="steps">
      <h2>How it works</h2>
      <ol>
        <li><strong>Detect.</strong> Frame the object; adjust the bounding box.</li>
        <li><strong>Capture.</strong> Walk around it in guided passes. Three at different heights is Apple's recommendation.</li>
        <li><strong>Reconstruct.</strong> Photogrammetry runs on device. No upload, no account.</li>
        <li><strong>Use it.</strong> A USDZ plus width, height and depth in metres.</li>
      </ol>
    </section>

    <section class="requirements">
      <h2>Requirements</h2>
      <ul>
        <li>iPhone 12 Pro or newer (LiDAR)</li>
        <li>iOS 17+</li>
        <li>React Native 0.79+ with the New Architecture</li>
      </ul>
      <p class="note">Expo works too, via the bundled config plugin. Check support at runtime with <code>ObjectCaptureSession.isDeviceSupported()</code>.</p>
    </section>

    <section class="quickstart">
      <h2>Quick start</h2>
<pre><code>import { ObjectCaptureView, PhotogrammetrySession } from 'react-native-object-capture';

PhotogrammetrySession.addDimensionsListener(({ width, height, depth }) => {
  console.log(`${width} × ${height} × ${depth} m`);
});

&lt;ObjectCaptureView
  imagesDirectory="Images/"
  checkpointDirectory="Snapshots/"
  onScanPassCompleted={(e) => e.nativeEvent.completed &amp;&amp; showPassReview()}
/&gt;</code></pre>
      <p><a href="https://github.com/tristanheilman/react-native-object-capture#readme">Full API reference in the README →</a></p>
    </section>
  </main>

  <footer>
    <p>MIT licensed · <a href="https://github.com/tristanheilman/react-native-object-capture">GitHub</a> · <a href="https://www.npmjs.com/package/react-native-object-capture">npm</a></p>
    <p class="note">This site uses Cloudflare Web Analytics: no cookies, no personal data.</p>
  </footer>

  <script>
    // Respect reduced motion: the poster stays, and the visitor can press play.
    const demo = document.getElementById('demo');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      demo.autoplay = true;
      demo.play().catch(() => {});
    }
    // Clipboard API needs a secure context; fall back to selecting the text.
    document.getElementById('copy').addEventListener('click', async (e) => {
      const text = document.getElementById('install-cmd').textContent;
      try {
        await navigator.clipboard.writeText(text);
        e.target.textContent = 'Copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById('install-cmd'));
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        e.target.textContent = 'Press ⌘C';
      }
      setTimeout(() => { e.target.textContent = 'Copy'; }, 2000);
    });
  </script>
  <!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "3968fcefe556444d804d5a7812cb5f7f"}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>
```

Before writing the quick start, check that each API it uses exists with that exact name and prop in `src/index.ts` and `README.md` (`ObjectCaptureView` props `imagesDirectory`, `checkpointDirectory`, `onScanPassCompleted`; `PhotogrammetrySession.addDimensionsListener`). Adjust to match. The page must not show an API that doesn't exist.

- [ ] **Step 2: Write `website/style.css`**

```css
:root {
  --bg: #0B0B0F; --surface: #16161D; --raised: #1F1F28;
  --border: rgba(255,255,255,.08); --text: #F5F5F7; --muted: #A1A1AA;
  --accent: #4F8CFF; --radius: 16px;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font: 17px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
a { color: var(--accent); }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em; }
h1 { font-size: clamp(2rem, 5vw, 3.25rem); line-height: 1.1; margin: .25em 0 .4em; }
h2 { font-size: 1.6rem; margin: 0 0 .6em; }
.note { color: var(--muted); font-size: .9rem; }

.hero, main > section, footer { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
.hero { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: center; padding-top: 72px; padding-bottom: 48px; }
.eyebrow { color: var(--accent); font-weight: 600; letter-spacing: .06em; text-transform: uppercase; font-size: .8rem; margin: 0; }
.lede { color: var(--muted); font-size: 1.1rem; max-width: 34em; }

.install { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 8px 8px 8px 16px; margin: 24px 0 16px; max-width: 100%; }
.install code { flex: 1; min-width: 0; overflow-x: auto; white-space: nowrap; }
.install button { background: var(--raised); color: var(--text); border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: .9rem; cursor: pointer; }
.install button:hover { background: #2a2a35; }

.actions { display: flex; gap: 12px; flex-wrap: wrap; }
.button { display: inline-block; padding: 12px 22px; border-radius: 12px; background: var(--raised); color: var(--text); text-decoration: none; font-weight: 600; }
.button.primary { background: var(--accent); color: #fff; }

/* Reserve the cropped recording's aspect so the layout doesn't jump while loading. */
.phone { justify-self: center; width: min(340px, 100%); }
.phone video { display: block; width: 100%; aspect-ratio: 540 / 1120; object-fit: cover; border-radius: 28px; border: 1px solid var(--border); background: var(--surface); }

main > section { padding-top: 56px; padding-bottom: 8px; }
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0 8px; }
.stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; display: flex; flex-direction: column; gap: 4px; }
.stat .label { color: var(--muted); font-size: .9rem; }
.stat .value { font-size: 1.4rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.stat.accent { border-color: rgba(79,140,255,.45); }

.steps ol { padding-left: 1.2em; } .steps li { margin: .4em 0; }
.requirements ul { padding-left: 1.2em; }
pre { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; overflow-x: auto; font-size: .85rem; line-height: 1.5; }

footer { padding-top: 48px; padding-bottom: 48px; color: var(--muted); font-size: .9rem; }

@media (max-width: 760px) {
  .hero { grid-template-columns: 1fr; padding-top: 40px; gap: 32px; }
  .compare { grid-template-columns: 1fr; }
}
```

Set `aspect-ratio` to the real output dimensions: `ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 website/media/demo.mp4`.

- [ ] **Step 3: Verify locally**

```bash
python3 -m http.server 8765 -d website
```

With a browser tool (Playwright or Chrome), load `http://localhost:8765/`:
- At **375×812**: `document.documentElement.scrollWidth <= window.innerWidth` is `true`. No horizontal scroll (Review Focus 2).
- At **1280×800**: hero shows two columns; take a screenshot.
- Emulate `prefers-reduced-motion: reduce` and reload: `document.getElementById('demo').paused` is `true`, and the poster shows (Review Focus 1).
- Click **Copy**: the label changes to "Copied". The page is on `localhost`, a secure context. Then call `delete navigator.clipboard` in the console and click again: the label reads "Press ⌘C", the text is selected, and the console shows no error (Review Focus 4).
- Network panel: no 404s. `grep -nE '(src|href)="/' website/index.html` prints nothing (Review Focus 5).
- Throttle the network to "Slow 3G" and reload: the poster appears before the video and the hero doesn't shift (Review Focus 3).

- [ ] **Step 4: Commit**

```bash
git add website/index.html website/style.css
git commit -m "docs: add the public landing page

One static page rather than a docs framework, so the README stays the
single home for the API docs and the two can't drift. Leads with the
recorded scan and the measured-vs-tape comparison, since true scale is
what sets the library apart."
```

---

### Task 3: Pages deployment

**Files:**
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Consumes: the `website/` directory (Tasks 1–2).

- [ ] **Step 1: Write the workflow**

```yaml
name: Pages

# Deploys website/ as-is. Separate from ci.yml on purpose: ci.yml has no
# push trigger (PRs already ran it), while the site must publish from main.
on:
  push:
    branches: [main]
    paths: ['website/**', '.github/workflows/pages.yml']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# One deploy at a time; let an in-flight deploy finish rather than cancel it.
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v5
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v4
        with:
          path: website
      - id: deployment
        uses: actions/deploy-pages@v4
```

Before committing, check each action's current major on its GitHub releases page (`gh api repos/actions/<name>/releases/latest --jq .tag_name`) and use it. #41 is about actions on the deprecated Node 20 runtime, so don't add new ones.

- [ ] **Step 2: Validate the YAML**

```bash
ruby -ryaml -e 'YAML.load_file(".github/workflows/pages.yml"); puts "ok"'
```

Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/pages.yml
git commit -m "ci: deploy website/ to GitHub Pages from main"
```

The live deploy can only be verified after merge: open the Actions tab → **Pages** run → its URL. Load `https://tristanheilman.github.io/react-native-object-capture/`, confirm the video plays and the network panel shows `beacon.min.js` loading with no 404s, then check Cloudflare → Web Analytics for a first visit (it can take a few minutes).

---

### Task 4: README demo and homepage links

**Files:**
- Modify: `README.md` (just below the badges)
- Modify: `package.json` (`homepage`)

**Interfaces:**
- Consumes: `docs/media/demo.gif` (Task 1), the site URL (Task 3).

- [ ] **Step 1: Add the GIF to the README.** Insert directly below the badge block:

```markdown
<p align="center">
  <a href="https://tristanheilman.github.io/react-native-object-capture/">
    <img src="docs/media/demo.gif" width="320" alt="Scanning a tissue box with a LiDAR iPhone, then the finished model reporting its size: 23.5 × 12.7 × 13.8 cm, toggled to inches">
  </a>
</p>
```

Match the alt text to the GIF's actual content as frame-checked in Task 1 step 4.

- [ ] **Step 2: Point `homepage` at the site**

In `package.json`, set `"homepage": "https://tristanheilman.github.io/react-native-object-capture/"`.

- [ ] **Step 3: Check that nothing else changed**

```bash
yarn lint && yarn typecheck && yarn test --silent
git diff --stat
```

Expected: lint shows 0 errors; tests pass; the diff touches only `README.md` and `package.json`.

- [ ] **Step 4: Commit (two commits, since they ship differently)**

```bash
git add README.md
git commit -m "docs: show the capture-to-model demo at the top of the README

Closes #28"
git add package.json
git commit -m "chore: point the npm homepage at the project site"
```

- [ ] **Step 5: Owner action after merge (not code).** Set the repo's Website field to the site URL, either in the About panel on GitHub or with `gh repo edit tristanheilman/react-native-object-capture --homepage https://tristanheilman.github.io/react-native-object-capture/`. It's outward-facing, so the owner runs it or explicitly asks for it.

---

## Self-review notes

- Spec coverage: video (Task 1), site sections/look/analytics (Task 2), deploy (Task 3), README #28 + homepage links (Task 4), owner actions (Task 3 note, Task 4 step 5). Pages enablement and the Cloudflare token are already done.
- Review Focus 1–5 each map to a check in Task 2 step 3.
- Ships as one PR (`docs:` title), squash-merged. The `chore:` homepage commit won't produce a changelog line either way.
