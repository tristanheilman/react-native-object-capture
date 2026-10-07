// Dark and camera-first: the capture screen is a live camera feed, so the rest
// of the app matches it rather than flashing white between screens.
export const colors = {
  background: '#0B0B0F',
  surface: '#16161D',
  surfaceRaised: '#1F1F28',
  border: 'rgba(255, 255, 255, 0.08)',
  // Translucent controls drawn over the camera feed.
  overlay: 'rgba(18, 18, 24, 0.72)',
  overlayStrong: 'rgba(18, 18, 24, 0.88)',

  text: '#F5F5F7',
  textSecondary: '#A1A1AA',
  textTertiary: '#6B6B76',

  accent: '#4F8CFF',
  accentPressed: '#3B74E0',
  accentMuted: 'rgba(79, 140, 255, 0.16)',
  success: '#34C759',
  successMuted: 'rgba(52, 199, 89, 0.16)',
  warning: '#FFB020',
  warningMuted: 'rgba(255, 176, 32, 0.16)',
  danger: '#FF5A5F',
  dangerMuted: 'rgba(255, 90, 95, 0.16)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const type = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, color: colors.text },
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  headline: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 17, color: colors.text },
  callout: { fontSize: 15, color: colors.textSecondary },
  footnote: { fontSize: 13, color: colors.textSecondary },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textTertiary,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
};

// Apple's guidance for Object Capture is three passes at different heights.
export const RECOMMENDED_PASSES = 3;
