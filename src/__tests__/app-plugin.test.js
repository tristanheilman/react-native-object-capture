const mockWithInfoPlist = jest.fn((config, action) =>
  action({
    ...config,
    modResults: { ...config.modResults },
  })
);

jest.mock('expo/config-plugins', () => ({ withInfoPlist: mockWithInfoPlist }), {
  virtual: true,
});

const withObjectCapture = require('../../app.plugin');

describe('withObjectCapture', () => {
  const createConfig = () => ({
    name: 'ObjectCaptureExample',
    slug: 'object-capture-example',
    modResults: { ExistingKey: 'preserved' },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds sensible default iOS permission descriptions', () => {
    const result = withObjectCapture(createConfig());

    expect(result.modResults).toEqual({
      ExistingKey: 'preserved',
      NSCameraUsageDescription:
        'This app needs camera access to capture 3D objects',
      NSPhotoLibraryUsageDescription:
        'This app needs photo library access to save captured 3D objects',
      NSPhotoLibraryAddUsageDescription:
        'This app needs photo library access to save captured 3D objects',
    });
  });

  it('uses custom permission descriptions from plugin props', () => {
    const result = withObjectCapture(createConfig(), {
      cameraPermission: 'Scan an object with the camera',
      photoLibraryPermission: 'Read source images from the photo library',
      photoLibraryAddPermission: 'Save the generated model',
    });

    expect(result.modResults).toEqual({
      ExistingKey: 'preserved',
      NSCameraUsageDescription: 'Scan an object with the camera',
      NSPhotoLibraryUsageDescription:
        'Read source images from the photo library',
      NSPhotoLibraryAddUsageDescription: 'Save the generated model',
    });
  });
});
