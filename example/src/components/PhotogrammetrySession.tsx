import { useState } from 'react';
import { Pressable, View, Text, StyleSheet, TextInput } from 'react-native';
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
  const [unit, setUnit] = useState<Unit>('cm');
  const {
    error,
    progress,
    result,
    dimensions,
    startReconstruction,
    cancelReconstruction,
  } = usePhotogrammetrySession();

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
          {dimensions && (
            <>
              <View style={styles.dimensionsHeader}>
                <Text style={type.caption}>Size</Text>
                <UnitToggle unit={unit} onChange={setUnit} />
              </View>
              <View style={styles.dimensions}>
                <Dimension
                  label="Width"
                  metres={dimensions.width}
                  unit={unit}
                />
                <Dimension
                  label="Height"
                  metres={dimensions.height}
                  unit={unit}
                />
                <Dimension
                  label="Depth"
                  metres={dimensions.depth}
                  unit={unit}
                />
              </View>
            </>
          )}
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

type Unit = 'cm' | 'in';

// onDimensions reports metres. One decimal reads naturally for handheld
// objects in either unit and still shows millimetre-level differences.
const UNIT_FACTOR: Record<Unit, number> = { cm: 100, in: 39.3701 };

function Dimension({
  label,
  metres,
  unit,
}: {
  label: string;
  metres: number;
  unit: Unit;
}) {
  return (
    <View style={styles.dimension}>
      <Text style={styles.dimensionValue}>
        {(metres * UNIT_FACTOR[unit]).toFixed(1)}
      </Text>
      <Text style={type.footnote}>
        {label} · {unit}
      </Text>
    </View>
  );
}

function UnitToggle({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
}) {
  return (
    <View style={styles.toggle} accessibilityRole="radiogroup">
      {(['cm', 'in'] as const).map((u) => (
        <Pressable
          key={u}
          accessibilityRole="radio"
          accessibilityState={{ selected: unit === u }}
          onPress={() => onChange(u)}
          style={[styles.toggleOption, unit === u && styles.toggleSelected]}
        >
          <Text
            style={[
              styles.toggleLabel,
              unit === u && styles.toggleLabelSelected,
            ]}
          >
            {u}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

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
  dimensionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dimensions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  toggleOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  toggleSelected: {
    backgroundColor: colors.accent,
  },
  toggleLabel: {
    ...type.footnote,
    fontWeight: '600',
  },
  toggleLabelSelected: {
    color: '#FFFFFF',
  },
  dimension: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  dimensionValue: {
    ...type.title,
    fontVariant: ['tabular-nums'],
  },
  spacer: {
    flex: 1,
  },
});
