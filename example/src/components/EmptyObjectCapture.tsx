import { View, Text, StyleSheet } from 'react-native';

const EmptyObjectCapture = () => {
  return (
    <View>
      <Text style={styles.text}>EmptyObjectCapture</Text>
    </View>
  );
};

export default EmptyObjectCapture;

const styles = StyleSheet.create({
  text: {
    color: 'blue',
  },
});
