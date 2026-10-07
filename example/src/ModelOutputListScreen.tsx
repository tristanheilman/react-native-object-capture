import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  PhotogrammetrySession,
  type PhotogrammetryDirectoryContents,
} from 'react-native-object-capture';
import { formatBytes, formatDate } from './labels';
import { colors, radius, spacing, type } from './theme';

type ModelFile = PhotogrammetryDirectoryContents['files'][number];

type ModelOutputListScreenProps = {
  navigation: any;
};

export default function ModelOutputListScreen({
  navigation,
}: ModelOutputListScreenProps) {
  const [models, setModels] = useState<ModelFile[] | null>(null);

  // Refresh on focus, so a model built a moment ago shows up on return.
  useFocusEffect(
    useCallback(() => {
      PhotogrammetrySession.listDirectoryContents('Outputs/')
        .then((contents) => {
          setModels(
            contents.files
              .filter((f) => !f.isDirectory)
              .sort((a, b) => b.creationDate - a.creationDate)
          );
        })
        .catch((err) => {
          console.error('Failed to list outputs directory:', err);
          setModels([]);
        });
    }, [])
  );

  if (models === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      data={models}
      keyExtractor={(item) => item.path}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={EmptyState}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('ModelOutputScreen', {
              path: item.path,
              name: item.name,
            })
          }
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        >
          <View style={styles.thumb}>
            <Text style={styles.thumbGlyph}>◆</Text>
          </View>
          <View style={styles.itemText}>
            <Text style={type.headline} numberOfLines={1}>
              {item.name.replace(/\.usdz$/i, '')}
            </Text>
            <Text style={type.footnote}>
              {[formatBytes(item.size), formatDate(item.creationDate)]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={type.headline}>No models yet</Text>
      <Text style={[type.footnote, styles.emptyBody]}>
        Finish a scan and build it, and the model will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  itemPressed: {
    backgroundColor: colors.surfaceRaised,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbGlyph: {
    color: colors.accent,
    fontSize: 20,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  chevron: {
    color: colors.textTertiary,
    fontSize: 24,
  },
  separator: {
    height: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyBody: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
