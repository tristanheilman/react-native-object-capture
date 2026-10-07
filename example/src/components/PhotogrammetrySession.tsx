import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import usePhotogrammetrySession from '../hooks/usePhotogrammetrySession';
import { Button, Card } from '../ui';
import { colors, radius, spacing, type } from '../theme';

// A dated default, so building a second model doesn't silently overwrite the
// first one under the same name.
function defaultModelName() {
  const d = new Date();
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `scan-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

const PhotogrammetrySession = ({
  onViewModels,
}: {
  onViewModels: () => void;
}) => {
  const [modelName, setModelName] = useState(defaultModelName);
  const [started, setStarted] = useState(false);
  const { error, progress, result, startReconstruction, cancelReconstruction } =
    usePhotogrammetrySession();

  const fileName = `${modelName.trim().replace(/\.usdz$/i, '') || 'model'}.usdz`;
  const running = started && !result && !error;

  const start = () => {
    setStarted(true);
    startReconstruction({
      imagesDirectory: 'Images/',
      checkpointDirectory: 'Snapshots/',
      outputPath: `Outputs/${fileName}`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={type.caption}>File name</Text>
        <View style={[styles.inputRow, running && styles.inputDisabled]}>
          <TextInput
            style={styles.input}
            value={modelName}
            onChangeText={setModelName}
            editable={!running && result !== 'completed'}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="model"
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.suffix}>.usdz</Text>
        </View>
      </View>

      {running && (
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={type.headline}>Building model…</Text>
            <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.max(progress, 0.02) * 100}%` },
              ]}
            />
          </View>
          <Text style={type.footnote}>
            This can take a few minutes. Keep the app open.
          </Text>
        </Card>
      )}

      {result === 'completed' && (
        <Card style={[styles.statusCard, styles.successCard]}>
          <Text style={[type.headline, { color: colors.success }]}>
            Model ready
          </Text>
          <Text style={type.footnote}>Saved as {fileName}</Text>
        </Card>
      )}
      {result === 'cancelled' && (
        <Card style={styles.statusCard}>
          <Text style={type.headline}>Build cancelled</Text>
          <Text style={type.footnote}>
            Your captured photos are still here; you can start again.
          </Text>
        </Card>
      )}
      {error && (
        <Card style={[styles.statusCard, styles.errorCard]}>
          <Text style={[type.headline, { color: colors.danger }]}>
            Couldn't build the model
          </Text>
          <Text style={type.footnote}>{error.message}</Text>
        </Card>
      )}

      <View style={styles.spacer} />

      {result === 'completed' ? (
        <Button label="View your models" onPress={onViewModels} />
      ) : running ? (
        <Button
          label="Cancel"
          variant="danger"
          onPress={cancelReconstruction}
        />
      ) : (
        <Button label={started ? 'Try again' : 'Build model'} onPress={start} />
      )}
    </View>
  );
};

export default PhotogrammetrySession;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.lg,
    color: colors.text,
    fontSize: 17,
  },
  suffix: {
    ...type.body,
    color: colors.textTertiary,
  },
  progressCard: {
    gap: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  percent: {
    ...type.headline,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  statusCard: {
    gap: spacing.xs,
  },
  successCard: {
    borderColor: colors.successMuted,
  },
  errorCard: {
    borderColor: colors.dangerMuted,
  },
  spacer: {
    flex: 1,
  },
});
