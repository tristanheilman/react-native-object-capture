const { withInfoPlist } = require('expo/config-plugins');

const DEFAULT_CAMERA_PERMISSION =
  'This app needs camera access to capture 3D objects';
const DEFAULT_PHOTO_LIBRARY_PERMISSION =
  'This app needs photo library access to save captured 3D objects';

const withObjectCapture = (config, props = {}) =>
  withInfoPlist(config, (modConfig) => {
    modConfig.modResults.NSCameraUsageDescription =
      props.cameraPermission ?? DEFAULT_CAMERA_PERMISSION;
    modConfig.modResults.NSPhotoLibraryUsageDescription =
      props.photoLibraryPermission ?? DEFAULT_PHOTO_LIBRARY_PERMISSION;
    modConfig.modResults.NSPhotoLibraryAddUsageDescription =
      props.photoLibraryAddPermission ?? DEFAULT_PHOTO_LIBRARY_PERMISSION;

    return modConfig;
  });

module.exports = withObjectCapture;
