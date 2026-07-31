import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform, NativeModules, View } from 'react-native';
import {
  ObjectCapturePointCloudView,
  type ObjectCapturePointCloudViewRef,
} from '../index';

describe('RNObjectCapturePointCloudView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ObjectCapturePointCloudView
        checkpointDirectory="test"
        imagesDirectory="test"
      />
    );
    expect(getByTestId('RNObjectCapturePointCloudView')).toBeTruthy();
  });

  it('renders EmptyComponent correctly', async () => {
    const { getByTestId } = render(
      <ObjectCapturePointCloudView
        checkpointDirectory="test"
        imagesDirectory="test"
        ObjectCaptureEmptyComponent={<View testID={'emptyTest'} />}
      />
    );

    const event = {
      nativeEvent: {
        scanPassCompleted: true,
        target: 1,
      },
    };

    await act(async () => {
      getByTestId('RNObjectCapturePointCloudView').props.onAppear(event);
    });

    expect(getByTestId('emptyTest')).toBeTruthy();
  });

  it('does not render EmptyComponent correctly', async () => {
    const { queryByTestId } = render(
      <ObjectCapturePointCloudView
        checkpointDirectory="test"
        imagesDirectory="test"
        ObjectCaptureEmptyComponent={<View testID={'emptyTest'} />}
      />
    );

    expect(queryByTestId('emptyTest')).toBeNull();
  });

  it('renders LoadingComponent correctly', () => {
    const { getByTestId } = render(
      <ObjectCapturePointCloudView
        checkpointDirectory="test"
        imagesDirectory="test"
        ObjectCaptureLoadingComponent={<View testID={'loadingTest'} />}
      />
    );
    expect(getByTestId('loadingTest')).toBeTruthy();
  });

  describe('imperative methods', () => {
    let ref: React.RefObject<ObjectCapturePointCloudViewRef | null>;

    // Both ref methods read from the shared session rather than from this view,
    // so they delegate to the session module. No react tag is involved.
    beforeEach(() => {
      jest.clearAllMocks();
      Platform.OS = 'ios';
      ref = React.createRef();
      render(
        <ObjectCapturePointCloudView
          ref={ref}
          checkpointDirectory="test"
          imagesDirectory="test"
        />
      );
    });

    it('calls getSessionState on the session module', async () => {
      (
        NativeModules.RNObjectCaptureSession.getSessionState as jest.Mock
      ).mockResolvedValue('capturing');

      await act(async () => {
        await expect(ref.current?.getSessionState()).resolves.toBe('capturing');
      });

      expect(
        NativeModules.RNObjectCaptureSession.getSessionState
      ).toHaveBeenCalledWith();
    });

    it('calls getUserCompletedScanPass on the session module', async () => {
      (
        NativeModules.RNObjectCaptureSession
          .getUserCompletedScanState as jest.Mock
      ).mockResolvedValue(true);

      await act(async () => {
        await expect(ref.current?.getUserCompletedScanPass()).resolves.toBe(
          true
        );
      });

      expect(
        NativeModules.RNObjectCaptureSession.getUserCompletedScanState
      ).toHaveBeenCalledWith();
    });

    it('propagates native errors', async () => {
      (
        NativeModules.RNObjectCaptureSession.getSessionState as jest.Mock
      ).mockRejectedValue(new Error('No active session'));

      await act(async () => {
        await expect(ref.current?.getSessionState()).rejects.toThrow(
          'No active session'
        );
      });
    });
  });

  describe('on non-iOS platforms', () => {
    afterEach(() => {
      Platform.OS = 'ios';
    });

    it('renders nothing', () => {
      Platform.OS = 'android';
      const { queryByTestId } = render(
        <ObjectCapturePointCloudView
          checkpointDirectory="test"
          imagesDirectory="test"
        />
      );
      expect(queryByTestId('RNObjectCapturePointCloudView')).toBeNull();
    });
  });
});
