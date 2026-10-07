import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, type } from '../theme';

// Rendered after the point cloud in normal flow, so it overlays rather than
// stacking below a view that already fills its container.
const EmptyObjectCapture = () => {
  return (
    <View style={styles.overlay}>
      <Text style={type.headline}>Nothing captured yet</Text>
      <Text style={[type.footnote, styles.body]}>
        Your point cloud appears here once a scan pass completes.
      </Text>
    </View>
  );
};

export default EmptyObjectCapture;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  body: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
