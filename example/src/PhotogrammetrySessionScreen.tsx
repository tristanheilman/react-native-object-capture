import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PhotogrammetrySession from './components/PhotogrammetrySession';
import { IconButton } from './ui';
import { colors, spacing, type } from './theme';

type PhotogrammetrySessionScreenProps = {
  navigation: any;
};

export default function PhotogrammetrySessionScreen({
  navigation,
}: PhotogrammetrySessionScreenProps) {
  const insets = useSafeAreaInsets();

  const viewModels = () => {
    navigation.goBack();
    navigation.navigate('ModelOutputListScreen');
  };

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={type.title}>Build model</Text>
          <Text style={[type.callout, styles.subtitle]}>
            Turns your captured photos into a USDZ, on device.
          </Text>
        </View>
        <IconButton
          glyph="✕"
          accessibilityLabel="Close"
          onPress={() => navigation.goBack()}
        />
      </View>

      <PhotogrammetrySession onViewModels={viewModels} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
