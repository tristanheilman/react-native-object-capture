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

    beforeEach(() => {
      jest.clearAllMocks();
      ref = React.createRef();

      render(
        <ObjectCapturePointCloudView
          ref={ref}
          checkpointDirectory="test"
          imagesDirectory="test"
        />
      );
    });

    afterEach(() => {
      if (ref.current) {
        ref.current = null;
      }
    });

    it('calls getUserCompletedScanPass on native module', async () => {
      await act(async () => {
        await ref.current?.getUserCompletedScanPass();
      });

      expect(
        NativeModules.RNObjectCapturePointCloudView.getUserCompletedScanPass
      ).toHaveBeenCalledTimes(1);
    });

    it('calls getSessionState on native module', async () => {
      await act(async () => {
        await ref.current?.getSessionState();
      });

      expect(
        NativeModules.RNObjectCapturePointCloudView.getSessionState
      ).toHaveBeenCalledTimes(1);
    });

    it('gets session state from native module', async () => {
      const mockState = 'ready';
      (
        NativeModules.RNObjectCapturePointCloudView.getSessionState as jest.Mock
      ).mockResolvedValue(mockState);

      const state = await act(async () => {
        return await ref.current?.getSessionState();
      });

      expect(state).toBe(mockState);
      expect(
        NativeModules.RNObjectCapturePointCloudView.getSessionState
      ).toHaveBeenCalledTimes(1);
    });
  });
});
