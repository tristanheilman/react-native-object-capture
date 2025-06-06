import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform, NativeModules, findNodeHandle } from 'react-native';
import { ObjectCaptureView, type ObjectCaptureViewRef } from '../index';

describe('ObjectCaptureView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ObjectCaptureView testID="object-capture-view" />
    );
    expect(getByTestId('object-capture-view')).toBeTruthy();
  });

  it('returns null when platform is not iOS', () => {
    Platform.OS = 'android';
    const { container } = render(<ObjectCaptureView />);
    expect(container).toBeNull();
  });

  describe('event handlers', () => {
    it('calls onSessionStateChange when session state changes', () => {
      const onSessionStateChange = jest.fn();
      const { getByTestId } = render(
        <ObjectCaptureView
          testID="object-capture-view"
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
        getByTestId('object-capture-view').props.onSessionStateChange(event);
      });

      expect(onSessionStateChange).toHaveBeenCalledWith(event);
    });

    it('calls onTrackingStateChange when tracking state changes', () => {
      const onTrackingStateChange = jest.fn();
      const { getByTestId } = render(
        <ObjectCaptureView
          testID="object-capture-view"
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
        getByTestId('object-capture-view').props.onTrackingStateChange(event);
      });

      expect(onTrackingStateChange).toHaveBeenCalledWith(event);
    });

    // Add similar tests for other event handlers
  });

  describe('imperative methods', () => {
    let ref: React.RefObject<ObjectCaptureViewRef>;

    beforeEach(() => {
      ref = React.createRef();
      render(<ObjectCaptureView ref={ref} testID="object-capture-view" />);
    });

    it('calls resumeSession on native module', async () => {
      await act(async () => {
        await ref.current?.resumeSession();
      });

      expect(
        NativeModules.RNObjectCaptureView.resumeSession
      ).toHaveBeenCalledWith(1);
    });

    it('calls pauseSession on native module', async () => {
      await act(async () => {
        await ref.current?.pauseSession();
      });

      expect(
        NativeModules.RNObjectCaptureView.pauseSession
      ).toHaveBeenCalledWith(1);
    });

    it('calls startDetection on native module', async () => {
      await act(async () => {
        await ref.current?.startDetection();
      });

      expect(
        NativeModules.RNObjectCaptureView.startDetection
      ).toHaveBeenCalledWith(1);
    });

    it('throws error when view ref is not available', async () => {
      const { unmount } = render(<ObjectCaptureView ref={ref} />);
      unmount();

      await expect(ref.current?.resumeSession()).rejects.toThrow(
        'View or native module not found'
      );
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
      ).toHaveBeenCalledWith(1);
    });

    // Add similar tests for other imperative methods
  });

  describe('error handling', () => {
    let ref: React.RefObject<ObjectCaptureViewRef>;

    beforeEach(() => {
      ref = React.createRef();
      render(<ObjectCaptureView ref={ref} />);
    });

    it('handles native module errors', async () => {
      const mockError = new Error('Native module error');
      (
        NativeModules.RNObjectCaptureView.resumeSession as jest.Mock
      ).mockRejectedValue(mockError);

      await expect(ref.current?.resumeSession()).rejects.toThrow(
        'Native module error'
      );
    });

    it('handles missing view node', async () => {
      (findNodeHandle as jest.Mock).mockReturnValue(null);

      await expect(ref.current?.resumeSession()).rejects.toThrow(
        'View node not found'
      );
    });
  });
});
