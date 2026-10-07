import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openSettings, type PermissionStatus } from 'react-native-permissions';
import { ObjectCaptureSession } from 'react-native-object-capture';
import {
  checkCameraPermission,
  checkPhotoLibraryPermission,
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './permissions';
import { Button, Card, Pill, SectionHeader } from './ui';
import { colors, radius, spacing, type } from './theme';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  // null until checked, so nothing claims "denied" before the user was asked.
  const [supported, setSupported] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<PermissionStatus | null>(null);
  const [photos, setPhotos] = useState<PermissionStatus | null>(null);

  const refreshPermissions = useCallback(() => {
    checkCameraPermission().then(setCamera);
    checkPhotoLibraryPermission().then(setPhotos);
  }, []);

  useEffect(() => {
    // The capability gate, rather than Platform.OS: plenty of iPhones lack LiDAR.
    ObjectCaptureSession.isDeviceSupported()
      .then(setSupported)
      .catch(() => setSupported(false));
    refreshPermissions();
    // Pick up changes made in Settings while the app was in the background.
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshPermissions();
    });
    return () => sub.remove();
  }, [refreshPermissions]);

  const startScan = async () => {
    let status = camera;
    if (status !== 'granted') {
      status = await requestCameraPermission();
      setCamera(status);
    }
    if (status === 'granted') navigation.navigate('ObjectCaptureView');
  };

  const cameraBlocked = camera === 'blocked';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}
    >
      <Text style={type.largeTitle}>Object Capture</Text>
      <Text style={[type.callout, styles.subtitle]}>
        Scan a real object into a dimensionally accurate 3D model.
      </Text>

      {supported === false && (
        <Card style={styles.warningCard}>
          <Text style={[type.headline, styles.warningTitle]}>
            This device can't capture objects
          </Text>
          <Text style={type.footnote}>
            Object Capture needs a LiDAR sensor (iPhone 12 Pro or newer) and iOS
            17. You can still browse saved models.
          </Text>
        </Card>
      )}

      <Card style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeGlyph}>◎</Text>
        </View>
        <Text style={type.title}>New scan</Text>
        <Text style={[type.callout, styles.heroBody]}>
          Walk around your object in three passes. Takes about two minutes.
        </Text>
        <Button
          label={cameraBlocked ? 'Allow camera in Settings' : 'Start scanning'}
          onPress={cameraBlocked ? openSettings : startScan}
          disabled={supported === false}
          style={styles.heroButton}
        />
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('ModelOutputListScreen')}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <View style={styles.rowIcon}>
          <Text style={styles.rowIconGlyph}>▦</Text>
        </View>
        <View style={styles.rowText}>
          <Text style={type.headline}>Your models</Text>
          <Text style={type.footnote}>View and share finished USDZ files</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <SectionHeader title="Permissions" />
      <Card style={styles.permissions}>
        <PermissionRow
          title="Camera"
          detail="Required to scan"
          status={camera}
          onRequest={() => requestCameraPermission().then(setCamera)}
        />
        <View style={styles.divider} />
        <PermissionRow
          title="Photo library"
          detail="Optional, for saving models"
          status={photos}
          onRequest={() => requestPhotoLibraryPermission().then(setPhotos)}
        />
      </Card>
    </ScrollView>
  );
}

function PermissionRow({
  title,
  detail,
  status,
  onRequest,
}: {
  title: string;
  detail: string;
  status: PermissionStatus | null;
  onRequest: () => void;
}) {
  return (
    <View style={styles.permissionRow}>
      <View style={styles.rowText}>
        <Text style={type.body}>{title}</Text>
        <Text style={type.footnote}>{detail}</Text>
      </View>
      {status === 'granted' || status === 'limited' ? (
        <Pill
          label={status === 'limited' ? 'Limited' : 'Allowed'}
          tone="success"
        />
      ) : status === 'denied' ? (
        <Button
          label="Allow"
          variant="ghost"
          onPress={onRequest}
          style={styles.inlineButton}
        />
      ) : status === 'blocked' ? (
        <Button
          label="Settings"
          variant="ghost"
          onPress={openSettings}
          style={styles.inlineButton}
        />
      ) : status === 'unavailable' ? (
        <Pill label="Unavailable" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  warningCard: {
    borderColor: colors.warningMuted,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  warningTitle: {
    color: colors.warning,
  },
  hero: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroBadgeGlyph: {
    color: colors.accent,
    fontSize: 24,
  },
  heroBody: {
    marginBottom: spacing.md,
  },
  heroButton: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconGlyph: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: 24,
  },
  permissions: {
    paddingVertical: spacing.xs,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  inlineButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
});
