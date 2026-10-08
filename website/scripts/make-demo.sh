#!/usr/bin/env bash
# Cut the demo from two screen recordings into the site and README assets.
# Sources stay outside the repo; only the outputs are committed, so re-run
# this rather than editing the outputs by hand.
#
# Usage: website/scripts/make-demo.sh <capture-recording> <ending-recording>
#   capture: detection + two passes. Its own ending predates the onDimensions
#            fix (#50) and shows the old capture-volume size, so it's cut
#            before "Build model".
#   ending:  recorded on the fixed build: build, Model ready (correct size,
#            cm/in toggle), viewer.
set -euo pipefail

SRC_A="$1"
SRC_B="$2"
ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT

CROP_TOP=180   # iOS status bar + Dynamic Island; app controls start ~210 px
W=540          # output width; height follows the cropped aspect

# "start end speed" in source seconds; speed 1 = real time.
A_SEGMENTS=( "0 1.6 1" "1.6 9 3" "9 72 12" "72 76 1" "77 132 12" "132 135 1" )
B_SEGMENTS=( "5 6 1" "6 40 17" "40 46 1" "49 53 1" "56 61 1" )
POSTER_AT=42                                   # in SRC_B: Model ready, cm
GIF_SEGMENTS=( "A 20 44 6" "B 40 45 1" "B 49 53 1" )

seg() { # src start end speed out
  ffmpeg -v error -y -ss "$2" -to "$3" -i "$1" -an \
    -vf "crop=in_w:in_h-${CROP_TOP}:0:${CROP_TOP},setpts=PTS/$4,fps=30,scale=${W}:-2" \
    -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p "$5"
}

concat_list() { # out-list prefix segments...
  local list=$1 prefix=$2; shift 2; : > "$list"; local n=0
  for s in "$@"; do
    read -r a b sp <<<"$s"
    seg "$SRC" "$a" "$b" "$sp" "$WORK/$prefix$n.mp4"
    echo "file '$WORK/$prefix$n.mp4'" >> "$list"; n=$((n+1))
  done
}

SRC="$SRC_A"; concat_list "$WORK/a.txt" a "${A_SEGMENTS[@]}"
SRC="$SRC_B"; concat_list "$WORK/b.txt" b "${B_SEGMENTS[@]}"
cat "$WORK/a.txt" "$WORK/b.txt" > "$WORK/all.txt"

mkdir -p "$ROOT/website/media" "$ROOT/docs/media"
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/all.txt" -c copy -movflags +faststart "$ROOT/website/media/demo.mp4"

ffmpeg -v error -y -ss "$POSTER_AT" -i "$SRC_B" -frames:v 1 \
  -vf "crop=in_w:in_h-${CROP_TOP}:0:${CROP_TOP},scale=${W}:-2" -q:v 7 "$ROOT/website/media/demo-poster.jpg"

# README GIF: one capture burst, then Model ready and the cm/in toggle.
: > "$WORK/g.txt"; n=0
for s in "${GIF_SEGMENTS[@]}"; do
  read -r which a b sp <<<"$s"
  if [ "$which" = A ]; then src="$SRC_A"; else src="$SRC_B"; fi
  seg "$src" "$a" "$b" "$sp" "$WORK/g$n.mp4"; echo "file '$WORK/g$n.mp4'" >> "$WORK/g.txt"; n=$((n+1))
done
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/g.txt" -c copy "$WORK/gif.mp4"
ffmpeg -v error -y -i "$WORK/gif.mp4" -vf "fps=12,scale=320:-2:flags=lanczos,palettegen=max_colors=96:stats_mode=diff" "$WORK/pal.png"
ffmpeg -v error -y -i "$WORK/gif.mp4" -i "$WORK/pal.png" \
  -lavfi "fps=12,scale=320:-2:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" "$ROOT/docs/media/demo.gif"

# Budgets: these files live in git history forever.
check() {
  local f=$1 max=$2 sz; sz=$(stat -f%z "$f")
  echo "$(basename "$f"): $((sz/1024)) KB (max $((max/1024)) KB)"
  [ "$sz" -le "$max" ] || { echo "OVER BUDGET: $f" >&2; exit 1; }
}
check "$ROOT/website/media/demo.mp4"        $((6*1024*1024))
check "$ROOT/website/media/demo-poster.jpg" $((150*1024))
check "$ROOT/docs/media/demo.gif"           $((5*1024*1024))
