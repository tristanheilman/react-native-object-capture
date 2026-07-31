import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform, NativeModules } from 'react-native';
import { ObjectCaptureView, type ObjectCaptureViewRef } from '../index';

describe('RNObjectCaptureView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ObjectCaptureView checkpointDirectory="test" imagesDirectory="test" />
    );
    expect(getByTestId('RNObjectCaptureView')).toBeTruthy();
  });

  it('forwards overCaptureEnabled to the native component', () => {
    const { getByTestId } = render(
      <ObjectCaptureView
        checkpointDirectory="test"
        imagesDirectory="test"
        overCaptureEnabled
      />
    );
    expect(getByTestId('RNObjectCaptureView').props.overCaptureEnabled).toBe(
      true
    );
  });

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

    // Each of these used to resolve a react tag via findNodeHandle and pass it
    // to a view manager method that ignored it. The ref now delegates straight
    // to the session module, so there is no per-view state to set up.
    const VOID_METHODS = [
      'resumeSession',
      'pauseSession',
      'startDetection',
      'resetDetection',
      'startCapturing',
      'beginNewScanAfterFlip',
      'beginNewScan',
      'finishSession',
      'cancelSession',
    ] as const;

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

    it.each(VOID_METHODS)('calls %s on the session module', async (method) => {
      const native = NativeModules.RNObjectCaptureSession[method] as jest.Mock;
      native.mockResolvedValue(undefined);

      await act(async () => {
        await ref.current?.[method]();
      });

      expect(native).toHaveBeenCalledTimes(1);
      // No react tag is passed any more - the session is a singleton.
      expect(native).toHaveBeenCalledWith();
    });

    it('returns the session state from the session module', async () => {
      (
        NativeModules.RNObjectCaptureSession.getSessionState as jest.Mock
      ).mockResolvedValue('detecting');

      await act(async () => {
        await expect(ref.current?.getSessionState()).resolves.toBe('detecting');
      });
    });

    it('returns the tracking state from the session module', async () => {
      (
        NativeModules.RNObjectCaptureSession.getTrackingState as jest.Mock
      ).mockResolvedValue('normal');

      await act(async () => {
        await expect(ref.current?.getTrackingState()).resolves.toBe('normal');
      });
    });

    it('returns the feedback state from the session module', async () => {
      (
        NativeModules.RNObjectCaptureSession.getFeedbackState as jest.Mock
      ).mockResolvedValue(['objectTooClose']);

      await act(async () => {
        await expect(ref.current?.getFeedbackState()).resolves.toEqual([
          'objectTooClose',
        ]);
      });
    });

    it('returns the number of shots taken', async () => {
      (
        NativeModules.RNObjectCaptureSession.getNumberOfShotsTaken as jest.Mock
      ).mockResolvedValue(42);

      await act(async () => {
        await expect(ref.current?.getNumberOfShotsTaken()).resolves.toBe(42);
      });
    });

    it('returns the number of scan pass updates', async () => {
      (
        NativeModules.RNObjectCaptureSession
          .getNumberOfScanPassUpdates as jest.Mock
      ).mockResolvedValue(3);

      await act(async () => {
        await expect(ref.current?.getNumberOfScanPassUpdates()).resolves.toBe(
          3
        );
      });
    });

    it('returns the user completed scan state', async () => {
      (
        NativeModules.RNObjectCaptureSession
          .getUserCompletedScanState as jest.Mock
      ).mockResolvedValue(true);

      await act(async () => {
        await expect(ref.current?.getUserCompletedScanState()).resolves.toBe(
          true
        );
      });
    });

    it('reports whether the device is supported', async () => {
      (
        NativeModules.RNObjectCaptureSession.isDeviceSupported as jest.Mock
      ).mockResolvedValue(true);

      await act(async () => {
        await expect(ref.current?.isDeviceSupported()).resolves.toBe(true);
      });
    });

    it('propagates native errors', async () => {
      (
        NativeModules.RNObjectCaptureSession.startDetection as jest.Mock
      ).mockRejectedValue(new Error('Session is not ready'));

      await act(async () => {
        await expect(ref.current?.startDetection()).rejects.toThrow(
          'Session is not ready'
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
        <ObjectCaptureView checkpointDirectory="test" imagesDirectory="test" />
      );
      expect(queryByTestId('RNObjectCaptureView')).toBeNull();
    });
  });

  describe('when the native module is unavailable', () => {
    it('rejects with an actionable message', async () => {
      jest.resetModules();
      // TurboModuleRegistry.get returns null when the module is not registered,
      // which is what happens on any non-iOS platform.
      jest.doMock('../specs/NativeObjectCaptureSession', () => ({
        __esModule: true,
        default: null,
      }));

      const { default: Session } = require('../modules/ObjectCaptureSession');

      await expect(Session.startDetection()).rejects.toThrow(
        'RNObjectCaptureSession native module is not available'
      );

      jest.dontMock('../specs/NativeObjectCaptureSession');
    });
  });
});
