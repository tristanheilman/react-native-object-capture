#!/usr/bin/env bash
# Builds a stock React Native app at a given version with this library installed
# from a packed tarball, the way a consumer gets it from npm. The example app
# can't do this: it pins packages (react-native-screens especially) to the one
# RN line it ships with, so swapping its RN version tests the example's
# dependencies, not the library.
#
#   .github/scripts/rn-compat-app.sh <react-native version> <library .tgz> <work dir>
#
# Compiles for generic iOS without signing; no device, no simulator runtime.
set -euo pipefail

RN_VERSION="$1"
TARBALL="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
WORK_DIR="$3"
APP=RNCompat

mkdir -p "$WORK_DIR"
cd "$WORK_DIR"
rm -rf "$APP"

npx --yes @react-native-community/cli@latest init "$APP" \
  --version "$RN_VERSION" --skip-git-init --install-pods false --pm npm
cd "$APP"
npm install "$TARBALL"

# A screen that touches the public API, so typecheck and bundle resolve the
# library against this RN version's types and module layout.
cat > App.tsx <<'EOF'
import { View } from 'react-native';
import {
  ObjectCaptureSession,
  ObjectCaptureView,
  ObjectCapturePointCloudView,
  PhotogrammetrySession,
  QuickLookView,
} from 'react-native-object-capture';

export default function App() {
  void ObjectCaptureSession.isDeviceSupported();
  void PhotogrammetrySession;
  return (
    <View style={{ flex: 1 }}>
      <ObjectCaptureView imagesDirectory="Images" checkpointDirectory="Snapshots" style={{ flex: 1 }} />
      <ObjectCapturePointCloudView imagesDirectory="Images" checkpointDirectory="Snapshots" style={{ flex: 1 }} />
      <QuickLookView path="" style={{ flex: 1 }} />
    </View>
  );
}
EOF

npx tsc --noEmit
npx react-native bundle --platform ios --dev false --entry-file index.js \
  --bundle-output "$WORK_DIR/main.jsbundle" --assets-dest "$WORK_DIR/assets"

cd ios
ruby - <<'EOF'
podfile = File.read('Podfile')
# The podspec requires iOS 17 (Object Capture's floor); the template targets
# RN's minimum, which is lower. Consumers have to make this same edit.
podfile.sub!(/^platform :ios, .*$/, "platform :ios, '17.0'")
# fmt 11.0.x (RN <= 0.82) enables a consteval check that Xcode 26's clang
# rejects, inside RN's own pods, with or without this library. Compiling the
# fmt pod as C++17 turns that path off. Newer fmt fixes it, so leave it alone.
podfile.sub!(/^(\s*)react_native_post_install\(.*?\n\s*\)\n/m) do |call|
  indent = Regexp.last_match(1)
  call + <<~RUBY.gsub(/^/, indent)
    fmt = installer.pod_targets.find { |t| t.name == 'fmt' }
    if fmt && fmt.root_spec.version < Pod::Version.new('11.1')
      installer.pods_project.targets.select { |t| t.name == 'fmt' }.each do |t|
        t.build_configurations.each { |c| c.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17' }
      end
    end
  RUBY
end
File.write('Podfile', podfile)
EOF

bundle install
# Prebuilt core where the RN version has it (0.81+); older versions ignore these.
RCT_USE_PREBUILT_RNCORE=1 RCT_USE_RN_DEP=1 bundle exec pod install

# The full log goes to a file (uploaded on failure); the console gets errors
# only. Success is read from the log, since the filter's exit code isn't it.
xcodebuild -workspace "$APP.xcworkspace" -scheme "$APP" -configuration Debug \
  -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build \
  | tee "$WORK_DIR/xcodebuild.log" | grep -E '(: error:|\*\* BUILD)' || true
grep -q '\*\* BUILD SUCCEEDED \*\*' "$WORK_DIR/xcodebuild.log"
