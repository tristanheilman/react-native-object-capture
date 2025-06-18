import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { QuickLookView } from '../index';

describe('RNQuickLookView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <QuickLookView path="test" style={{ width: 100, height: 100 }} />
    );
    expect(getByTestId('RNQuickLookView')).toBeTruthy();
  });
});
