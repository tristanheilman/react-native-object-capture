import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ObjectCapturePointCloudView,
  ObjectCaptureSession,
  type ObjectCapturePointCloudViewRef,
} from 'react-native-object-capture';
import EmptyObjectCapture from './components/EmptyObjectCapture';
import LoadingObjectCapture from './components/LoadingObjectCapture';
import { Button, SectionHeader } from './ui';
import { colors, radius, spacing, type } from './theme';

type ObjectSessionHelpModalProps = {
  navigation: any;
};

const TIPS = [
  {
    title: 'Use even, diffuse light',
    body: 'Avoid harsh shadows and reflections. Overcast daylight is ideal.',
  },
  {
    title: 'Move slowly and steadily',
    body: 'Keep the whole object in frame and circle it at a walking pace.',
  },
  {
    title: 'Scan from three heights',
    body: 'One pass level with the object, one above, one below if you can.',
  },
  {
    title: 'Flip rigid objects',
    body: 'Turn the object over between passes to capture the underside.',
  },
  {
    title: 'Pick a textured surface',
    body: 'Plain, shiny or transparent objects are hard to reconstruct.',
  },
];

export default function ObjectSessionHelpModal({
  navigation,
}: ObjectSessionHelpModalProps) {
  const insets = useSafeAreaInsets();
  const [numberOfScanPassUpdates, setNumberOfScanPassUpdates] = useState(-1);
  const pointCloudViewRef = useRef<ObjectCapturePointCloudViewRef>(null);

  const handleResumeSession = async () => {
    await ObjectCaptureSession.resumeSession();
    navigation.goBack();
  };

  useEffect(() => {
    ObjectCaptureSession.getNumberOfScanPassUpdates().then(
      setNumberOfScanPassUpdates
    );
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.title}>Scanning tips</Text>
        <Text style={[type.callout, styles.subtitle]}>
          The scan is paused while you read.
        </Text>

        <View style={styles.tips}>
          {TIPS.map((tip, i) => (
            <View key={tip.title} style={styles.tip}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.tipText}>
                <Text style={type.headline}>{tip.title}</Text>
                <Text style={type.footnote}>{tip.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <SectionHeader
          title={
            numberOfScanPassUpdates > 0
              ? `Progress · ${numberOfScanPassUpdates} ${numberOfScanPassUpdates === 1 ? 'pass' : 'passes'} complete`
              : 'Progress'
          }
        />
        <View style={styles.preview}>
          <ObjectCapturePointCloudView
            ref={pointCloudViewRef}
            imagesDirectory="Images/"
            checkpointDirectory="Snapshots/"
            // height and width must be set for the point cloud view to render
            style={styles.pointCloud}
            ObjectCaptureEmptyComponent={EmptyObjectCapture}
            ObjectCaptureLoadingComponent={LoadingObjectCapture}
          />
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Button label="Resume scanning" onPress={handleResumeSession} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  tips: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  tip: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumberText: {
    color: colors.accent,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    gap: 2,
  },
  preview: {
    height: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  pointCloud: {
    width: '100%',
    height: 240,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
