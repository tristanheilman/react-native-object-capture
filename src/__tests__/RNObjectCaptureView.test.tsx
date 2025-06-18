import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform, NativeModules } from 'react-native';
import { ObjectCaptureView, type ObjectCaptureViewRef } from '../index';
import * as Handle from 'react-native/Libraries/ReactNative/RendererProxy';

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

    it('calls resetDetection on native module', async () => {
      await act(async () => {
        await ref.current?.resetDetection();
      });

      expect(
        NativeModules.RNObjectCaptureView.resetDetection
      ).toHaveBeenCalledTimes(1);
    });

    it('calls startCapturing on native module', async () => {
      await act(async () => {
        await ref.current?.startCapturing();
      });

      expect(
        NativeModules.RNObjectCaptureView.startCapturing
      ).toHaveBeenCalledTimes(1);
    });

    it('calls beginNewScanAfterFlip on native module', async () => {
      await act(async () => {
        await ref.current?.beginNewScanAfterFlip();
      });

      expect(
        NativeModules.RNObjectCaptureView.beginNewScanAfterFlip
      ).toHaveBeenCalledTimes(1);
    });

    it('calls beginNewScan on native module', async () => {
      await act(async () => {
        await ref.current?.beginNewScan();
      });

      expect(
        NativeModules.RNObjectCaptureView.beginNewScan
      ).toHaveBeenCalledTimes(1);
    });

    it('calls finishSession on native module', async () => {
      await act(async () => {
        await ref.current?.finishSession();
      });

      expect(
        NativeModules.RNObjectCaptureView.finishSession
      ).toHaveBeenCalledTimes(1);
    });

    it('calls cancelSession on native module', async () => {
      await act(async () => {
        await ref.current?.cancelSession();
      });

      expect(
        NativeModules.RNObjectCaptureView.cancelSession
      ).toHaveBeenCalledTimes(1);
    });

    it('calls getTrackingState on native module', async () => {
      await act(async () => {
        await ref.current?.getTrackingState();
      });

      expect(
        NativeModules.RNObjectCaptureView.getTrackingState
      ).toHaveBeenCalledTimes(1);
    });

    it('calls getFeedbackState on native module', async () => {
      await act(async () => {
        await ref.current?.getFeedbackState();
      });

      expect(
        NativeModules.RNObjectCaptureView.getFeedbackState
      ).toHaveBeenCalledTimes(1);
    });

    it('calls getNumberOfShotsTaken on native module', async () => {
      await act(async () => {
        await ref.current?.getNumberOfShotsTaken();
      });

      expect(
        NativeModules.RNObjectCaptureView.getNumberOfShotsTaken
      ).toHaveBeenCalledTimes(1);
    });

    it('calls getNumberOfScanPassUpdates on native module', async () => {
      await act(async () => {
        await ref.current?.getNumberOfScanPassUpdates();
      });

      expect(
        NativeModules.RNObjectCaptureView.getNumberOfScanPassUpdates
      ).toHaveBeenCalledTimes(1);
    });

    it('calls getUserCompletedScanState on native module', async () => {
      await act(async () => {
        await ref.current?.getUserCompletedScanState();
      });

      expect(
        NativeModules.RNObjectCaptureView.getUserCompletedScanState
      ).toHaveBeenCalledTimes(1);
    });

    it('calls isDeviceSupported on native module', async () => {
      await act(async () => {
        await ref.current?.isDeviceSupported();
      });

      expect(
        NativeModules.RNObjectCaptureView.isDeviceSupported
      ).toHaveBeenCalledTimes(1);
    });

    it('calls getSessionState on native module', async () => {
      await act(async () => {
        await ref.current?.getSessionState();
      });

      expect(
        NativeModules.RNObjectCaptureView.getSessionState
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

  describe('error handling for android', () => {
    let query: (testID: string) => HTMLElement | null;
    let ref: React.RefObject<ObjectCaptureViewRef | null>;

    beforeEach(() => {
      jest.clearAllMocks();
      Platform.OS = 'android';

      ref = React.createRef();
      const { queryByTestId } = render(
        <ObjectCaptureView
          ref={ref}
          checkpointDirectory="test"
          imagesDirectory="test"
        />
      );

      query = queryByTestId;
    });

    it('returns null when platform is not iOS', () => {
      expect(query('RNObjectCaptureView')).toBeNull();
    });

    it('fails to call pauseSession on native module', async () => {
      await expect(ref.current?.pauseSession()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call resumeSession on native module', async () => {
      await expect(ref.current?.resumeSession()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call startDetection on native module', async () => {
      await expect(ref.current?.startDetection()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call resetDetection on native module', async () => {
      await expect(ref.current?.resetDetection()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call startCapturing on native module', async () => {
      await expect(ref.current?.startCapturing()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call beginNewScanAfterFlip on native module', async () => {
      await expect(ref.current?.beginNewScanAfterFlip()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call beginNewScan on native module', async () => {
      await expect(ref.current?.beginNewScan()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call finishSession on native module', async () => {
      await expect(ref.current?.finishSession()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call cancelSession on native module', async () => {
      await expect(ref.current?.cancelSession()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call getTrackingState on native module', async () => {
      await expect(ref.current?.getTrackingState()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call getFeedbackState on native module', async () => {
      await expect(ref.current?.getFeedbackState()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call getNumberOfShotsTaken on native module', async () => {
      await expect(ref.current?.getNumberOfShotsTaken()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call getNumberOfScanPassUpdates on native module', async () => {
      await expect(ref.current?.getNumberOfScanPassUpdates()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call getUserCompletedScanState on native module', async () => {
      await expect(ref.current?.getUserCompletedScanState()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call isDeviceSupported on native module', async () => {
      await expect(ref.current?.isDeviceSupported()).rejects.toThrow(
        'View or native module not found'
      );
    });

    it('fails to call getSessionState on native module', async () => {
      await expect(ref.current?.getSessionState()).rejects.toThrow(
        'View or native module not found'
      );
    });
  });

  describe('error handling invalid node handle', () => {
    let ref: React.RefObject<ObjectCaptureViewRef | null>;

    beforeEach(() => {
      jest.clearAllMocks();
      Platform.OS = 'ios';
      jest.spyOn(Handle, 'findNodeHandle').mockReturnValue(null);
      ref = React.createRef();
      render(
        <ObjectCaptureView
          ref={ref}
          checkpointDirectory="test"
          imagesDirectory="test"
        />
      );
    });

    it('fails to call pauseSession on native module', async () => {
      await expect(ref.current?.pauseSession()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call resumeSession on native module', async () => {
      await expect(ref.current?.resumeSession()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call startDetection on native module', async () => {
      await expect(ref.current?.startDetection()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call resetDetection on native module', async () => {
      await expect(ref.current?.resetDetection()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call startCapturing on native module', async () => {
      await expect(ref.current?.startCapturing()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call beginNewScanAfterFlip on native module', async () => {
      await expect(ref.current?.beginNewScanAfterFlip()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call beginNewScan on native module', async () => {
      await expect(ref.current?.beginNewScan()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call finishSession on native module', async () => {
      await expect(ref.current?.finishSession()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call cancelSession on native module', async () => {
      await expect(ref.current?.cancelSession()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call getTrackingState on native module', async () => {
      await expect(ref.current?.getTrackingState()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call getFeedbackState on native module', async () => {
      await expect(ref.current?.getFeedbackState()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call getNumberOfShotsTaken on native module', async () => {
      await expect(ref.current?.getNumberOfShotsTaken()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call getNumberOfScanPassUpdates on native module', async () => {
      await expect(ref.current?.getNumberOfScanPassUpdates()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call getUserCompletedScanState on native module', async () => {
      await expect(ref.current?.getUserCompletedScanState()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call isDeviceSupported on native module', async () => {
      await expect(ref.current?.isDeviceSupported()).rejects.toThrow(
        'View node not found'
      );
    });

    it('fails to call getSessionState on native module', async () => {
      await expect(ref.current?.getSessionState()).rejects.toThrow(
        'View node not found'
      );
    });
  });

  //   it('handles native module errors', async () => {
  //     const mockError = new Error('Native module error');
  //     (
  //       NativeModules.RNObjectCaptureView.resumeSession as jest.Mock
  //     ).mockRejectedValue(mockError);

  //     await expect(ref.current?.resumeSession()).rejects.toThrow(
  //       'Native module error'
  //     );
  //   });

  //   it('handles missing view node', async () => {
  //     jest.clearAllMocks();
  //     jest.mock('react-native', () => ({
  //       ...jest.requireActual('react-native'),
  //       NativeModules: {
  //         RNObjectCaptureView: {
  //           resumeSession: jest.fn(),
  //         },
  //       },
  //       findNodeHandle: jest.fn().mockReturnValue(null),
  //     }));

  //     await expect(ref.current?.resumeSession()).rejects.toThrow(
  //       'View node not found'
  //     );
  //   });
  // });
});
