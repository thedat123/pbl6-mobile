import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

const AudioPlayer = ({ audioUri }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    const loadAudio = async () => {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis / 1000);
        setIsReady(true);
      }
    };

    loadAudio();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [audioUri]);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setHasEnded(true);
        setPosition(duration);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!soundRef.current || !isReady) return;
  
    try {
      const status = await soundRef.current.getStatusAsync();
  
      if (hasEnded) {
        await soundRef.current.unloadAsync();
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        soundRef.current = sound;
        setHasEnded(false);
        setIsPlaying(true);
        return;
      }
  
      if (status.isPlaying) {
        soundRef.current.setStatusAsync({ shouldPlay: false });
      } else {
        soundRef.current.setStatusAsync({ shouldPlay: true });
      }
    } catch (error) {
      Alert.alert("Error", "Unable to play audio. Please try again.");
    }
  };  

  const handleSeek = async (value) => {
    if (soundRef.current && isReady) {
      try {
        await soundRef.current.setPositionAsync(value * 1000);
        setHasEnded(false);
      } catch (error) {
        console.error("Error seeking audio:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.audioPlayerContainer}>
      <View style={styles.audioControls}>
        <TouchableOpacity onPress={handlePlayPause} disabled={!isReady}>
          <Ionicons 
            name={hasEnded ? "reload" : (isPlaying ? "pause" : "play")} 
            size={24} 
            color="#000000" 
          />
        </TouchableOpacity>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#000000"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#000000"
          enabled={isReady}
        />
        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  audioPlayerContainer: {
    marginVertical: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 8,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    minWidth: 45,
  },
});

export default AudioPlayer;
