const mockWithInfoPlist = jest.fn((config, action) =>
  action({
    ...config,
    modResults: { ...config.modResults },
  })
);

// Podfile properties are a separate mod with their own modResults; keep them
// on their own key so the Info.plist assertions below see only Info.plist.
const mockWithPodfileProperties = jest.fn((config, action) => ({
  ...config,
  podfileProperties: action({
    ...config,
    modResults: { ...config.podfileProperties },
  }).modResults,
}));

jest.mock(
  'expo/config-plugins',
  () => ({
    withInfoPlist: mockWithInfoPlist,
    withPodfileProperties: mockWithPodfileProperties,
  }),
  { virtual: true }
);

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

  it('preserves existing iOS permission descriptions', () => {
    const config = createConfig();
    config.modResults = {
      ...config.modResults,
      NSCameraUsageDescription: 'Scan inventory items in 3D',
      NSPhotoLibraryUsageDescription: 'Pick reference photos',
      NSPhotoLibraryAddUsageDescription: 'Save captured models',
    };

    const result = withObjectCapture(config);

    expect(result.modResults).toEqual(config.modResults);
  });

  describe('iOS deployment target', () => {
    const withTarget = (target) => ({
      ...createConfig(),
      podfileProperties:
        target === undefined ? {} : { 'ios.deploymentTarget': target },
    });

    it('sets 17.0 when the app has no deployment target', () => {
      const result = withObjectCapture(withTarget(undefined));

      expect(result.podfileProperties['ios.deploymentTarget']).toBe('17.0');
    });

    it("raises Expo's default target to 17.0", () => {
      const result = withObjectCapture(withTarget('16.4'));

      expect(result.podfileProperties['ios.deploymentTarget']).toBe('17.0');
    });

    it.each(['17.0', '17.4', '18', '26.0'])(
      'keeps a target already at or above 17.0 (%s)',
      (target) => {
        const result = withObjectCapture(withTarget(target));

        expect(result.podfileProperties['ios.deploymentTarget']).toBe(target);
      }
    );

    it('leaves other Podfile properties alone', () => {
      const config = withTarget('15.1');
      config.podfileProperties['expo.jsEngine'] = 'hermes';

      const result = withObjectCapture(config);

      expect(result.podfileProperties).toEqual({
        'expo.jsEngine': 'hermes',
        'ios.deploymentTarget': '17.0',
      });
    });
  });
});
