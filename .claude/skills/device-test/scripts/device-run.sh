#!/usr/bin/env bash
# Build the example app, install it on a connected iPhone, and launch it with
# its console streamed to a log file.
#
# Release, not Debug: a Release build bundles the JS, so the phone doesn't need
# to reach Metro on the Mac. print() output still arrives via --console.
#
# Usage: device-run.sh [--compile-only] [--log <path>] [--no-launch]
#   --compile-only  build for a generic device, unsigned; no phone needed
#   --log <path>    where to write the console stream (default: $TMPDIR/rnoc-console.log)
#   --no-launch     build and install, but don't launch
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
IOS="$ROOT/example/ios"
DERIVED="${TMPDIR:-/tmp}/rnoc-derived-data"
LOG="${TMPDIR:-/tmp}/rnoc-console.log"
BUNDLE_ID="objectcapture.example"
COMPILE_ONLY=0
LAUNCH=1

while [ $# -gt 0 ]; do
  case "$1" in
    --compile-only) COMPILE_ONLY=1 ;;
    --log) LOG="$2"; shift ;;
    --no-launch) LAUNCH=0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

build() {
  # xcodebuild's output is enormous; keep it in a file and surface only the verdict.
  local buildlog="$DERIVED.build.log"
  if ! xcodebuild -workspace "$IOS/ObjectCaptureExample.xcworkspace" \
      -scheme ObjectCaptureExample -derivedDataPath "$DERIVED" "$@" \
      build >"$buildlog" 2>&1; then
    grep -E "^/.*error:" "$buildlog" | sort -u | head -20 >&2
    echo "BUILD FAILED (full log: $buildlog)" >&2
    exit 1
  fi
  echo "BUILD SUCCEEDED"
}

if [ "$COMPILE_ONLY" = 1 ]; then
  build -configuration Debug -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
  exit 0
fi

# CoreDevice identifier (for devicectl) of the first reachable iPhone. A locked
# or sleeping phone reports "connected" rather than "available (paired)"; accept
# both and let devicectl say so if it really can't install.
DEVICE_ID="$(xcrun devicectl list devices 2>/dev/null \
  | awk '/iPhone/ && /available \(paired\)|connected/ { for (i = 1; i <= NF; i++) if ($i ~ /^[0-9A-F-]{36}$/) { print $i; exit } }')"
if [ -z "$DEVICE_ID" ]; then
  echo "No reachable iPhone found. Connect and unlock it, or use --compile-only." >&2
  xcrun devicectl list devices >&2 || true
  exit 1
fi
# xcodebuild uses the hardware UDID, which differs from the CoreDevice ID.
UDID="$(xcrun devicectl device info details --device "$DEVICE_ID" 2>/dev/null \
  | awk -F': ' '/udid:/ { print $2; exit }')"
DESTINATION="platform=iOS,id=${UDID:?could not read device UDID}"
echo "Device: $DEVICE_ID (udid $UDID)"

build -configuration Release -destination "$DESTINATION" -allowProvisioningUpdates

APP="$DERIVED/Build/Products/Release-iphoneos/ObjectCaptureExample.app"
xcrun devicectl device install app --device "$DEVICE_ID" "$APP" >/dev/null
echo "Installed $APP"

if [ "$LAUNCH" = 1 ]; then
  echo "Launching with console -> $LOG (runs until the app exits)"
  exec xcrun devicectl device process launch --terminate-existing --console \
    --device "$DEVICE_ID" "$BUNDLE_ID" >"$LOG" 2>&1
fi
