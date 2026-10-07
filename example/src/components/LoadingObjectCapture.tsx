import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '../theme';

// Rendered after the point cloud in normal flow, so it overlays rather than
// stacking below a view that already fills its container.
const LoadingObjectCapture = () => {
  return (
    <View style={styles.overlay}>
      <ActivityIndicator color={colors.textSecondary} />
      <Text style={[type.footnote, styles.label]}>Loading point cloud…</Text>
    </View>
  );
};

export default LoadingObjectCapture;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  label: {
    marginTop: spacing.sm,
  },
});
