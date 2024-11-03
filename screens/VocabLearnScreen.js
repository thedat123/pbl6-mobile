import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const { width } = Dimensions.get('window');

// Sample vocabulary data
const vocabList = [
  {
    word: 'date',
    pronunciation: '/deit/',
    definition: '(n) an agreement to meet someone; a romantic appointment',
    example: 'She has a date tonight.',
    translation: 'Tối nay cô ấy sẽ đi hẹn hò.',
    image: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/date.png' },
  },
  {
    word: 'apple',
    pronunciation: '/ˈæp.l̩/',
    definition: '(n) a round fruit with red or green skin',
    example: 'She ate an apple for lunch.',
    translation: 'Cô ấy ăn một quả táo vào bữa trưa.',
    image: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/date.png' },
  },
  {
    word: 'car',
    pronunciation: '/kɑːr/',
    definition: '(n) a road vehicle with an engine, four wheels, and seats for a few people',
    example: 'He drives a red car.',
    translation: 'Anh ấy lái một chiếc xe màu đỏ.',
    image: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/date.png' },
  },
];

const VocabLearnScreen = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [progress, setProgress] = useState(1 / vocabList.length);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentView, setCurrentView] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = 50;
        if (gestureState.dx < -swipeThreshold) {
          handleNextWord(); // Swipe left to go to the next word
        } else if (gestureState.dx > swipeThreshold) {
          handlePreviousWord(); // Swipe right to go back to the previous word
        }
      },
    })
  ).current;

  const handleRotate = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      rotateAnim.setValue(0);
      setCurrentView((prevView) => (prevView + 1) % 3);
    });
  };

  const handleNextWord = () => {
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        setProgress((newIndex + 1) / vocabList.length);
        return newIndex;
      });
    } else {
      // Navigate to VocabWaitScreen when at the last word
      navigation.navigate('VocabWaitScreen');
    }
  };
  
  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex - 1;
        setProgress((newIndex + 1) / vocabList.length);
        return newIndex;
      });
    }
  };

  const handleSpeak = () => {
    const { word } = vocabList[currentIndex];
    Speech.speak(word, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.5,
      volume: 1.0,
    });
  };

  const renderContent = () => {
    const { word, pronunciation, definition, example, translation } = vocabList[currentIndex];
    const commonTextStyles = {
      fontSize: 18,
      color: '#004d40',
      textAlign: 'center',
    };

    if (currentView === 0) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{`${word} (n)`}</Text>
          <Text style={styles.pronunciation}>{pronunciation}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={handleSpeak}>
            <Icon name="volume-up" size={28} color="#00796b" />
          </TouchableOpacity>
        </View>
      );
    } else if (currentView === 1) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.definitionTitle}>Definition</Text>
          <Text style={styles.definition}>{definition}</Text>
        </View>
      );
    } else if (currentView === 2) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{word}</Text>
          <Text style={styles.pronunciation}>{pronunciation}</Text>
          <Text style={commonTextStyles}>Example:</Text>
          <Text style={commonTextStyles}>{example}</Text>
          <Text style={commonTextStyles}>Translation:</Text>
          <Text style={commonTextStyles}>{translation}</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{`${currentIndex + 1}/${vocabList.length}`}</Text>
          <ProgressBar progress={progress} />
        </View>

        {/* Vocabulary Card with Animation and PanResponder */}
        <View {...panResponder.panHandlers}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View style={[styles.cardContainer, { transform: [{ rotateY: rotateInterpolation }] }]}>
              <LinearGradient colors={['#ffffff', '#e0f2f1']} style={styles.card}>
                <Image source={vocabList[currentIndex].image} style={styles.image} />
                {renderContent()}
                {/* Rotate Icon */}
                <TouchableOpacity style={styles.rotateButton} onPress={handleRotate}>
                  <Icon name="refresh" size={28} color="#00796b" />
                  <Text style={styles.rotateText}>Rotate</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>

        {/* Navigation Arrows */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePreviousWord}
            activeOpacity={1} // Always allow the previous button to be pressed
          >
            <Icon name="chevron-left" size={36} color={currentIndex === 0 ? '#ddd' : '#00796b'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextWord}
            activeOpacity={1} // Always allow the next button to be pressed
          >
            <Icon name="chevron-right" size={36} color='#00796b' />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  progressText: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  cardContainer: {
    width: 320,
    height: 500,
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
    width: 200,
    height: 200,
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
  commonText: {
    fontSize: 18,
    color: '#004d40',
    textAlign: 'center',
    marginVertical: 5,
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
    marginTop: 30,
  },
  rotateText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#00796b',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  navButton: {
    padding: 10,
  },
});

export default VocabLearnScreen;
