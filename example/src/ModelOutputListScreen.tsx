import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  PhotogrammetrySession,
  type PhotogrammetryDirectoryContents,
} from 'react-native-object-capture';

type ModelOutputListScreenProps = {
  navigation: any;
};

export default function ModelOutputListScreen({
  navigation,
}: ModelOutputListScreenProps) {
  const [modelOutputs, setModelOutputs] = useState<
    PhotogrammetryDirectoryContents['files']
  >([]);

  useEffect(() => {
    PhotogrammetrySession.listDirectoryContents('Outputs/')
      .then((contents) => {
        setModelOutputs(contents.files);
      })
      .catch((err) => {
        console.error('Failed to list outputs directory:', err);
      });
  }, []);
  return (
    <View style={styles.container}>
      <FlatList
        data={modelOutputs}
        renderItem={({ item }) => (
          <ModelOutputItem item={item} navigation={navigation} />
        )}
      />
    </View>
  );
}

const ModelOutputItem = ({
  item,
  navigation,
}: {
  item: PhotogrammetryDirectoryContents['files'][number];
  navigation: any;
}) => {
  return (
    <Pressable
      style={styles.listItem}
      onPress={() =>
        navigation.navigate('ModelOutputScreen', { path: item.path })
      }
    >
      <Text style={styles.listItemText}>{item.name}</Text>
      <Text>{item.path}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 10,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listItemText: {
    fontWeight: 'bold',
  },
});
