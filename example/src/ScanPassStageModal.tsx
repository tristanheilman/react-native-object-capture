import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ObjectCapturePointCloudView,
  ObjectCaptureSession,
  type ObjectCapturePointCloudViewRef,
} from 'react-native-object-capture';
import EmptyObjectCapture from './components/EmptyObjectCapture';
import LoadingObjectCapture from './components/LoadingObjectCapture';
import { Button } from './ui';
import { colors, radius, RECOMMENDED_PASSES, spacing, type } from './theme';

type ScanPassStageModalProps = {
  navigation: any;
};

export default function ScanPassStageModal({
  navigation,
}: ScanPassStageModalProps) {
  const insets = useSafeAreaInsets();
  const pointCloudViewRef = useRef<ObjectCapturePointCloudViewRef>(null);
  const [numberOfScanPassUpdates, setNumberOfScanPassUpdates] = useState(-1);
  const [numberOfShots, setNumberOfShots] = useState(-1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ObjectCaptureSession.getNumberOfScanPassUpdates().then(
      setNumberOfScanPassUpdates
    );
    ObjectCaptureSession.getNumberOfShotsTaken().then(setNumberOfShots);
  }, []);

  const handleNextPass = async () => {
    setBusy(true);
    try {
      await ObjectCaptureSession.beginNewScan();
    } catch (err) {
      setBusy(false);
      Alert.alert('Cannot start a new pass', String(err));
      return;
    }
    await ObjectCaptureSession.resumeSession();
    navigation.goBack();
  };

  const handleFlip = async () => {
    setBusy(true);
    await ObjectCaptureSession.beginNewScanAfterFlip();
    await ObjectCaptureSession.resumeSession();
    navigation.goBack();
  };

  const handleFinish = async () => {
    setBusy(true);
    try {
      await ObjectCaptureSession.finishSession();
      navigation.popToTop();
      navigation.navigate('PhotogrammetrySessionScreen');
    } catch (err) {
      setBusy(false);
      console.error('Failed to finish session:', err);
    }
  };

  const passes = Math.max(numberOfScanPassUpdates, 0);
  // Once the recommended passes are in, finishing becomes the suggested step.
  const enoughPasses = passes >= RECOMMENDED_PASSES;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: spacing.xl, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <Text style={type.title}>
        {passes > 0 ? `Pass ${passes} complete` : 'Pass complete'}
      </Text>
      <Text style={[type.callout, styles.subtitle]}>
        {enoughPasses
          ? 'You have enough coverage to build a model.'
          : `Apple recommends ${RECOMMENDED_PASSES} passes at different heights for the best result.`}
      </Text>

      <View style={styles.stats}>
        <Stat
          label="Passes"
          value={numberOfScanPassUpdates < 0 ? '–' : `${passes}`}
        />
        <Stat
          label="Photos"
          value={numberOfShots < 0 ? '–' : `${numberOfShots}`}
        />
      </View>

      <View style={styles.preview}>
        <ObjectCapturePointCloudView
          ref={pointCloudViewRef}
          checkpointDirectory={'Snapshots/'}
          imagesDirectory={'Images/'}
          // height and width must be set for the cloud point view to render
          style={styles.pointCloud}
          ObjectCaptureEmptyComponent={EmptyObjectCapture}
          ObjectCaptureLoadingComponent={LoadingObjectCapture}
        />
      </View>

      {/* No Cancel: once a pass completes, the session waits for a new pass,
          a flip, or finish. There is no state to go back to the same pass. */}
      <View style={styles.actions}>
        <Button
          label="Scan another pass"
          variant={enoughPasses ? 'secondary' : 'primary'}
          onPress={handleNextPass}
          disabled={busy}
        />
        <Button
          label="Flip object and scan"
          variant="secondary"
          onPress={handleFlip}
          disabled={busy}
        />
        <Button
          label="Finish and build model"
          variant={enoughPasses ? 'primary' : 'ghost'}
          onPress={handleFinish}
          disabled={busy}
        />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={type.footnote}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  stat: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statValue: {
    ...type.title,
    fontVariant: ['tabular-nums'],
  },
  preview: {
    flex: 1,
    marginVertical: spacing.xl,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  pointCloud: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  actions: {
    gap: spacing.sm,
  },
});
