import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg from 'react-native-svg';
import { Circle } from 'react-native-svg';
import { Path } from 'react-native-svg';
import { Audio } from 'expo-av';

const TimeCounter = ({ initialTime = 10, onTimeOut, isTestComplete }) => {   
  const [timer, setTimer] = useState(initialTime);   
  const tickSoundRef = useRef(null);     

  useEffect(() => {
    let intervalId;
    
    const playTickSound = async () => {
      try {
        if (!tickSoundRef.current) {
          const { sound } = await Audio.Sound.createAsync(
            require('../assets/audio/clock_tick.mp3'),
            { shouldPlay: true }
          );
          tickSoundRef.current = sound;
          
          tickSoundRef.current.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              tickSoundRef.current?.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
              tickSoundRef.current = null;
            }
          });
        } else {
          await tickSoundRef.current.replayAsync();
        }
      } catch (error) {
        console.error("Error playing tick sound:", error);
      }
    };
    
    // Stop timer if test is complete
    if (isTestComplete) {
      return () => {
        if (tickSoundRef.current) {
          tickSoundRef.current.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
          tickSoundRef.current = null;
        }
      };
    }

    if (timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
        playTickSound();
      }, 1000);
    } else {
      onTimeOut();
    }
    
    return () => {
      clearInterval(intervalId);
      
      // Properly clean up the sound on component unmount
      if (tickSoundRef.current) {
        tickSoundRef.current.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
        tickSoundRef.current = null; // Reset reference after cleanup
      }
    };
  }, [timer, onTimeOut, isTestComplete]);

  return (
    <View style={styles.timerContainer}>
      <Svg
        width="31"
        height="31"
        viewBox="0 0 31 31"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Circle
          cx="15.5"
          cy="15.5"
          r="14"
          fill="#E7AEFF"
          fillOpacity="0.75"
          stroke="#CE82FF"
          strokeWidth="3"
        />
        <Path
          d="M14.6621 7.54102V17.1762H23.0405"
          stroke="#CE82FF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.timerText}>
        00:{timer < 10 ? `0${timer}` : timer}
      </Text>
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
    color: 'rgb(206, 130, 255)'
  },
});

export default TimeCounter;
