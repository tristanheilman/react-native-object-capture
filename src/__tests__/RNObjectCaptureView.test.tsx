import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform, NativeModules } from 'react-native';
import { ObjectCaptureView, type ObjectCaptureViewRef } from '../index';

describe('RNObjectCaptureView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ObjectCaptureView checkpointDirectory="test" imagesDirectory="test" />
    );
    expect(getByTestId('RNObjectCaptureView')).toBeTruthy();
  });

  //   it('returns null when platform is not iOS', () => {
  //     Platform.OS = 'android';
  //     const { container } = render(
  //       <ObjectCaptureView checkpointDirectory="test" imagesDirectory="test" />
  //     );
  //     expect(container).toBeNull();
  //   });

  describe('event handlers', () => {
    it('calls onSessionStateChange when session state changes', () => {
      const onSessionStateChange = jest.fn();
      const { getByTestId } = render(
        <ObjectCaptureView
          checkpointDirectory="test"
          imagesDirectory="test"
          onSessionStateChange={onSessionStateChange}
        />
      );

      const event = {
        nativeEvent: {
          state: 'ready',
          target: 1,
        },
      };

      act(() => {
        getByTestId('RNObjectCaptureView').props.onSessionStateChange(event);
      });

      expect(onSessionStateChange).toHaveBeenCalledWith(event);
    });

    it('calls onTrackingStateChange when tracking state changes', () => {
      const onTrackingStateChange = jest.fn();
      const { getByTestId } = render(
        <ObjectCaptureView
          checkpointDirectory="test"
          imagesDirectory="test"
          onTrackingStateChange={onTrackingStateChange}
        />
      );

      const event = {
        nativeEvent: {
          tracking: 'normal',
          target: 1,
        },
      };

      act(() => {
        getByTestId('RNObjectCaptureView').props.onTrackingStateChange(event);
      });

      expect(onTrackingStateChange).toHaveBeenCalledWith(event);
    });

    // Add similar tests for other event handlers
  });

  describe('imperative methods', () => {
    let ref: React.RefObject<ObjectCaptureViewRef | null>;

    beforeEach(() => {
      jest.clearAllMocks();
      ref = React.createRef();

      render(
        <ObjectCaptureView
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

    it('calls resumeSession on native module', async () => {
      await act(async () => {
        await ref.current?.resumeSession();
      });

      expect(
        NativeModules.RNObjectCaptureView.resumeSession
      ).toHaveBeenCalledTimes(1);
    });

    it('calls pauseSession on native module', async () => {
      await act(async () => {
        await ref.current?.pauseSession();
      });

      expect(
        NativeModules.RNObjectCaptureView.pauseSession
      ).toHaveBeenCalledTimes(1);
    });

    it('calls startDetection on native module', async () => {
      await act(async () => {
        await ref.current?.startDetection();
      });

      expect(
        NativeModules.RNObjectCaptureView.startDetection
      ).toHaveBeenCalledTimes(1);
    });

    it('gets session state from native module', async () => {
      const mockState = 'ready';
      (
        NativeModules.RNObjectCaptureView.getSessionState as jest.Mock
      ).mockResolvedValue(mockState);

      const state = await act(async () => {
        return await ref.current?.getSessionState();
      });

      expect(state).toBe(mockState);
      expect(
        NativeModules.RNObjectCaptureView.getSessionState
      ).toHaveBeenCalledTimes(1);
    });

    // Add similar tests for other imperative methods
  });

  //   describe('error handling', () => {
  //     let ref: React.RefObject<ObjectCaptureViewRef | null>;

  //     beforeEach(() => {
  //       ref = React.createRef();
  //       render(
  //         <ObjectCaptureView
  //           ref={ref}
  //           checkpointDirectory="test"
  //           imagesDirectory="test"
  //         />
  //       );
  //     });

  //     it('handles native module errors', async () => {
  //       const mockError = new Error('Native module error');
  //       (
  //         NativeModules.RNObjectCaptureView.resumeSession as jest.Mock
  //       ).mockRejectedValue(mockError);

  //       await expect(ref.current?.resumeSession()).rejects.toThrow(
  //         'Native module error'
  //       );
  //     });

  //     it('handles missing view node', async () => {
  //       jest.clearAllMocks();
  //       jest.mock('react-native', () => ({
  //         ...jest.requireActual('react-native'),
  //         NativeModules: {
  //           RNObjectCaptureView: {
  //             resumeSession: jest.fn(),
  //           },
  //         },
  //         findNodeHandle: jest.fn().mockReturnValue(null),
  //       }));

  //       await expect(ref.current?.resumeSession()).rejects.toThrow(
  //         'View node not found'
  //       );
  //     });
  //   });
});
