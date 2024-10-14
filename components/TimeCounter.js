import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const TimeCounter = ({ initialTime = 10, onTimeOut }) => {
  const [timer, setTimer] = useState(initialTime);

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      onTimeOut(); 
    }
  }, [timer, onTimeOut]);

  return (
    <View style={styles.timerContainer}>
      <Feather name="clock" size={20} color="black" />
      <Text style={styles.timerText}>00:{timer < 10 ? `0${timer}` : timer}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    margin: 20,
  },
  timerText: {
    fontSize: 18,
    marginLeft: 5,
    marginRight: 10,
    color: '#000',
  },
});

export default TimeCounter;
