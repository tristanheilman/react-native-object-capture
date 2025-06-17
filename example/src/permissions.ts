import { request, check, PERMISSIONS } from 'react-native-permissions';

export const requestCameraPermission = async () => {
  const result = await request(PERMISSIONS.IOS.CAMERA);
  console.log('requestCameraPermission', result);
  return result;
};

export const requestPhotoLibraryPermission = async () => {
  const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
  console.log('requestPhotoLibraryPermission', result);
  return result;
};

export const checkCameraPermission = async () => {
  const result = await check(PERMISSIONS.IOS.CAMERA);
  return result;
};

export const checkPhotoLibraryPermission = async () => {
  const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
  return result;
};
