import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const VocabLearnScreen = ({ route }) => {
  const { topicId } = route.params;

  const navigation = useNavigation();
  const [vocabList, setVocabList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentView, setCurrentView] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [sound, setSound] = useState();

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    if (topicId) {
      fetch(`http://10.0.2.2:3000/api/v1/topic/${topicId}`)
        .then(response => response.json())
        .then(data => {
          const words = data.__listWord__ || [];
          setVocabList(words);
          setProgress(1 / words.length);
        })
        .catch(error => console.error('Error fetching vocabulary data:', error));
    }
  }, [topicId]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = 50;
        if (gestureState.dx < -swipeThreshold) {
          handleNextWord();
        } else if (gestureState.dx > swipeThreshold) {
          handlePreviousWord();
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
      navigation.navigate('VocabWaitScreen', { topicId: topicId });
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

  const handleSpeak = async () => {
    const { audio } = vocabList[currentIndex];
    if (audio) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audio },
          { shouldPlay: true }
        );
        setSound(sound);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleSpeakExample = async () => {
    const { exampleAudio } = vocabList[currentIndex];
    if (exampleAudio) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: exampleAudio },
          { shouldPlay: true }
        );
        setSound(sound);
      } catch (error) {
        console.error('Error playing example audio:', error);
      }
    }
  };

  const renderContent = () => {
    if (vocabList.length === 0) {
      return <Text>Loading...</Text>;
    }

    const { word, pronunciation, definition, example, translate, thumbnail, wordClass } = vocabList[currentIndex];

    const commonTextStyles = {
      fontSize: 18,
      color: '#004d40',
      textAlign: 'center',
    };

    if (currentView === 0) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{`${word} (${wordClass})`}</Text>
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
          <Text style={styles.definition}>{definition || 'No definition available'}</Text>
        </View>
      );
    } else if (currentView === 2) {
      return (
        <View style={styles.wordContainer}>
          <Text style={styles.word}>{word}</Text>
          <Text style={styles.pronunciation}>{pronunciation}</Text>
          <Text style={commonTextStyles}>Example:</Text>
          <Text style={commonTextStyles}>{example}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={handleSpeakExample}>
            <Icon name="volume-up" size={28} color="#00796b" />
          </TouchableOpacity>
          <Text style={commonTextStyles}>Translation:</Text>
          <Text style={commonTextStyles}>{translate}</Text>
          {thumbnail && <Image source={{ uri: thumbnail }} style={styles.thumbnail} />}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{`${currentIndex + 1}/${vocabList.length}`}</Text>
          <ProgressBar progress={progress} />
        </View>

        <View {...panResponder.panHandlers}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View style={[styles.cardContainer, { transform: [{ rotateY: rotateInterpolation }] }]}>
              <LinearGradient colors={['#ffffff', '#e0f2f1']} style={styles.card}>
                <Image source={{ uri: vocabList[currentIndex]?.thumbnail }} style={styles.image} />
                {renderContent()}
                <TouchableOpacity style={styles.rotateButton} onPress={handleRotate}>
                  <Icon name="refresh" size={28} color="#00796b" />
                  <Text style={styles.rotateText}>Rotate</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePreviousWord}
            activeOpacity={1}
          >
            <Icon name="chevron-left" size={36} color={currentIndex === 0 ? '#ddd' : '#00796b'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextWord}
            activeOpacity={1}
          >
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
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '100%',  // Adjusted height to 100% to fit content properly
    paddingBottom: 30, // Added padding at the bottom to avoid cut-off content
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    marginTop: 30, // Added marginTop to add space at the top
  },
  progressText: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  cardContainer: {
    width: 320,
    height: 'auto',  // Allow card height to adjust dynamically
    marginBottom: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    minHeight: 300, // Ensures a minimum height for the card
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
    flexWrap: 'wrap',  // Allow word to wrap if too long
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
    flexShrink: 1,
    flexGrow: 1, // Allow content to grow if space is available
  },
  pronunciation: {
    fontSize: 16,
    color: '#757575',
    marginTop: 5,
    textAlign: 'center',  // Ensure pronunciation is centered
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
    marginVertical: 10, // Add vertical margin to prevent content overlap
  },
  commonText: {
    fontSize: 18,
    color: '#004d40',
    textAlign: 'center',
    marginVertical: 5,
  },
  iconButton: {
    marginTop: 10,
    marginBottom: 20,
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
    justifyContent: 'center', // Center rotate button
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
    marginTop: 20, // Added margin to give space at the bottom of the card
  },
  navButton: {
    padding: 5,
  },
});


export default VocabLearnScreen;
