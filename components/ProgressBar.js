import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Progress from 'react-native-progress';

const { width } = Dimensions.get('window');

const ProgressBar = ({ progress }) => {
  return (
    <View style={styles.progressContainer}>
      <Progress.Bar
        progress={progress}
        width={width * 0.6}
        height={12}
        color="#00796b"
        borderRadius={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default ProgressBar;
