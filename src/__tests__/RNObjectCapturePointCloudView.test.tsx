import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform, NativeModules, View } from 'react-native';
import {
  ObjectCapturePointCloudView,
  type ObjectCapturePointCloudViewRef,
} from '../index';
import * as Handle from 'react-native/Libraries/ReactNative/RendererProxy';
import type { QueryByQuery } from '@testing-library/react-native/build/queries/make-queries';
import type {
  TextMatch,
  TextMatchOptions,
} from '@testing-library/react-native/build/matches';
import type { CommonQueryOptions } from '@testing-library/react-native/build/queries/options';

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

  describe('error handling for android', () => {
    let query: QueryByQuery<TextMatch, CommonQueryOptions & TextMatchOptions>;

    beforeEach(() => {
      jest.clearAllMocks();
      Platform.OS = 'android';

      const { queryByTestId } = render(
        <ObjectCapturePointCloudView
          checkpointDirectory="test"
          imagesDirectory="test"
        />
      );

      query = queryByTestId;
    });

    it('returns null when platform is not iOS', () => {
      expect(query('RNObjectCapturePointCloudView')).toBeNull();
    });
  });

  describe('error handling invalid node handle', () => {
    let ref: React.RefObject<ObjectCapturePointCloudViewRef | null>;
    let query: QueryByQuery<TextMatch, CommonQueryOptions & TextMatchOptions>;

    beforeEach(() => {
      jest.clearAllMocks();
      Platform.OS = 'ios';
      jest.spyOn(Handle, 'findNodeHandle').mockReturnValue(null);
      ref = React.createRef();
      const { queryByTestId } = render(
        <ObjectCapturePointCloudView
          ref={ref}
          checkpointDirectory="test"
          imagesDirectory="test"
        />
      );

      query = queryByTestId;
    });

    it('fails to call getUserCompletedScanPass on native module', async () => {
      await expect(ref.current?.getUserCompletedScanPass()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call getSessionState on native module', async () => {
      await expect(ref.current?.getSessionState()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call checkScanPass on native module', async () => {
      const event = {
        nativeEvent: {
          target: 1,
        },
      };

      await expect(
        query('RNObjectCapturePointCloudView').props.onAppear(event)
      ).rejects.toThrow('View node not found');
    });
  });

  // describe('error handling', () => {
  //   it('returns null when requirenativeComponent throws error', () => {
  //     const mockRequireNativeComponent = jest.fn().mockImplementation(() => {
  //       throw new Error('test error');
  //     });
  //     Object.defineProperty(RN, 'requireNativeComponent', {
  //       get: () => mockRequireNativeComponent,
  //       configurable: true,
  //     });

  //     const { queryByTestId } = render(
  //       <ObjectCapturePointCloudView
  //         checkpointDirectory="test"
  //         imagesDirectory="test"
  //       />
  //     );

  //     expect(queryByTestId('RNObjectCapturePointCloudView')).toBeNull();
  //   });
  // });
});
