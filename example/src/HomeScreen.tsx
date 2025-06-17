import { Text, View, StyleSheet, Pressable } from 'react-native';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './permissions';
import { useState } from 'react';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [permissions, setPermissions] = useState({
    camera: false,
    photoLibrary: false,
    photoLibraryAddOnly: false,
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate('ObjectCaptureView');
        }}
      >
        <Text>Open Object Capture View</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate('ScanPassStageModal');
        }}
      >
        <Text>Open ScanPassStageModal</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate('ObjectSessionHelpModal');
        }}
      >
        <Text>Open ObjectSessionHelpModal</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate('PhotogrammetrySessionScreen');
        }}
      >
        <Text>Open PhotogrammetrySessionScreen</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate('ModelOutputListScreen');
        }}
      >
        <Text>View Model Outputs</Text>
      </Pressable>

      <View style={styles.permissionsContainer} />
      <Text>Permissions</Text>
      <Pressable
        style={styles.button}
        onPress={() =>
          requestCameraPermission().then((result) =>
            setPermissions({ ...permissions, camera: result === 'granted' })
          )
        }
      >
        <Text>
          Request Camera Permission [{permissions.camera ? 'granted' : 'denied'}
          ]
        </Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() =>
          requestPhotoLibraryPermission().then((result) =>
            setPermissions({
              ...permissions,
              photoLibrary: result === 'granted',
            })
          )
        }
      >
        <Text>
          Request Photo Library Permission [
          {permissions.photoLibrary ? 'granted' : 'denied'}]
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 10,
  },
  button: {
    backgroundColor: '#CD8987',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 5,
  },
  permissionsContainer: {
    marginTop: 20,
  },
});
