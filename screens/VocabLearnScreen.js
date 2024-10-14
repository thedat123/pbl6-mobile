import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';

const { width } = Dimensions.get('window');

const VocabLearnScreen = () => {
  const [progress, setProgress] = useState(1 / 20);
  const [currentView, setCurrentView] = useState(0);
  const [imageSource] = useState(require('../assets/images/Vocab/date.png'));
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleRotate = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
      setCurrentView((prevView) => (prevView + 1) % 3);
    });
  };

  const renderContent = () => {
    const commonTextStyles = {
      fontSize: 18,
      color: '#004d40',
      textAlign: 'center',
    };

    if (currentView === 0) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{`date (n)`}</Text>
          <Text style={styles.pronunciation}>{`/deit/`}</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="volume-up" size={28} color="#00796b" />
          </TouchableOpacity>
        </View>
      );
    } else if (currentView === 1) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.definitionTitle}>Định nghĩa</Text>
          <Text style={styles.definition}>
            (n) an agreement to marry somebody; the period during which two people are engaged
          </Text>
        </View>
      );
    } else if (currentView === 2) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{`date (n)`}</Text>
          <Text style={styles.pronunciation}>{`/deit/`}</Text>
          <Text style={commonTextStyles}>{`Example:`}</Text>
          <Text style={commonTextStyles}>{`She has a date tonight`}</Text>
          <Text style={commonTextStyles}>{`Translation:`}</Text>
          <Text style={commonTextStyles}>{`Tối nay cô ấy sẽ đi hẹn hò`}</Text>
        </View>
      );
    }
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>01/20</Text>
          <ProgressBar progress={progress} />
        </View>

        {/* Vocabulary Card with Animation */}
        <Animated.View style={[styles.cardContainer, { transform: [{ rotateY: rotateInterpolation }] }]}>
          <LinearGradient colors={['#ffffff', '#e0f2f1']} style={styles.card}>
            <Image source={imageSource} style={styles.image} />
            {renderContent()}
            {/* Rotate Icon */}
            <TouchableOpacity style={styles.rotateButton} onPress={handleRotate}>
              <Icon name="refresh" size={28} color="#00796b" />
              <Text style={styles.rotateText}>XOAY</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Navigation Arrows */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="chevron-left" size={36} color="#00796b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="chevron-right" size={36} color="#00796b" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',  // Center horizontally
    alignItems: 'center',      // Align vertically
    marginBottom: 20,
    width: '100%',             // Full width for centering
  },
  progressText: {
    marginLeft:20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  cardContainer: {
    width: 320,
    height: 400,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: '100%',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 15,
    marginBottom: 15,
  },
  word: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    flexShrink: 1,
  },
  pronunciation: {
    fontSize: 16,
    color: '#757575',
    marginTop: 5,
  },
  definitionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
  definition: {
    fontSize: 18,
    color: '#004d40',
    textAlign: 'center',
  },
  iconButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#e0f7fa',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  rotateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  rotateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#00796b',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    width: '80%',
  },
  navButton: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
  },
});

export default VocabLearnScreen;
