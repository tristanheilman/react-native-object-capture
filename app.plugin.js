const { withInfoPlist, withPodfileProperties } = require('expo/config-plugins');

const DEFAULT_CAMERA_PERMISSION =
  'This app needs camera access to capture 3D objects';
const DEFAULT_PHOTO_LIBRARY_PERMISSION =
  'This app needs photo library access to save captured 3D objects';

// Object Capture is iOS 17+, and the podspec says so. Expo's template targets
// lower (16.4 in SDK 57), so without this `pod install` refuses the pod with
// "required a higher minimum deployment target". Only ever raise: an app that
// already targets higher, e.g. via expo-build-properties, keeps its value.
const MIN_IOS_DEPLOYMENT_TARGET = '17.0';

const isLowerVersion = (a, b) => {
  const [aMajor = 0, aMinor = 0] = String(a).split('.').map(Number);
  const [bMajor = 0, bMinor = 0] = String(b).split('.').map(Number);
  return aMajor < bMajor || (aMajor === bMajor && aMinor < bMinor);
};

const withPermissions = (config, props) =>
  withInfoPlist(config, (modConfig) => {
    modConfig.modResults.NSCameraUsageDescription =
      props.cameraPermission ??
      modConfig.modResults.NSCameraUsageDescription ??
      DEFAULT_CAMERA_PERMISSION;
    modConfig.modResults.NSPhotoLibraryUsageDescription =
      props.photoLibraryPermission ??
      modConfig.modResults.NSPhotoLibraryUsageDescription ??
      DEFAULT_PHOTO_LIBRARY_PERMISSION;
    modConfig.modResults.NSPhotoLibraryAddUsageDescription =
      props.photoLibraryAddPermission ??
      modConfig.modResults.NSPhotoLibraryAddUsageDescription ??
      DEFAULT_PHOTO_LIBRARY_PERMISSION;

    return modConfig;
  });

const withDeploymentTarget = (config) =>
  withPodfileProperties(config, (modConfig) => {
    const current = modConfig.modResults['ios.deploymentTarget'];
    if (!current || isLowerVersion(current, MIN_IOS_DEPLOYMENT_TARGET)) {
      modConfig.modResults['ios.deploymentTarget'] = MIN_IOS_DEPLOYMENT_TARGET;
    }

    return modConfig;
  });

const withObjectCapture = (config, props = {}) =>
  withDeploymentTarget(withPermissions(config, props));

module.exports = withObjectCapture;
