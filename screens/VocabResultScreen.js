import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, ScrollView, Animated, Image } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';
import { useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Pagination from '../components/Pagination';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 4;
const VocabResultScreen = ({ route }) => {
  const { 
    topicId, 
    topicName, 
    results, 
    totalQuestions, 
    totalTime 
  } = route.params;

  // Navigation and state
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const progressAnimation = useMemo(() => new Animated.Value(0), []);
  const [detailedWords, setDetailedWords] = useState({ correct: [], incorrect: [] });
  const [loading, setLoading] = useState(true);
  const [correctCurrentPage, setCorrectCurrentPage] = useState(1);
  const [incorrectCurrentPage, setIncorrectCurrentPage] = useState(1);
  const [corrects, setCorrects] = useState([]);
  const [inCorrects, setInCorrects] = useState([]);
  const [maxCorrectAnswers, setMaxCorrectAnswers] = useState(0);

  const uniqueWords = useMemo(() => {
    return results ? [...new Set(results.map(r => r.currentIdQuestion))] : [];
  }, [results]);

  const correctWords = useMemo(() => {
    if (!results) return [];
    return uniqueWords.filter(wordId => {
      const attempts = results.filter(r => r.currentIdQuestion === wordId);
      return attempts.length > 0 && attempts.every(attempt => attempt.isCorrect);
    });
  }, [uniqueWords, results]);

  const incorrectWords = useMemo(() => {
    if (!results) return [];
    return uniqueWords.filter(wordId => !correctWords.includes(wordId));
  }, [uniqueWords, correctWords]);

  const correctAnswers =
  correctWords && correctWords.length > 0 ? correctWords.length : corrects.length;

  const incorrectAnswers =
  incorrectWords && incorrectWords.length > 0 ? incorrectWords.length : inCorrects.length;
  const totalQuestion = correctAnswers + incorrectAnswers;

  const ProgressCircle = ({ progress, size = 180, strokeWidth = 15, progressColor = '#4CAF50', backgroundColor = '#E8F5E9' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress * circumference);
  
    return (
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    );
  };

  useEffect(() => {
    if (results) {
      const targetProgress = correctAnswers / totalQuestion;
      progressAnimation.addListener(({ value }) => {
        setProgress(value);
      });

      Animated.timing(progressAnimation, {
        toValue: targetProgress,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      return () => progressAnimation.removeAllListeners();
    }
  }, [progressAnimation, correctAnswers, totalQuestion, results]);

  // API Functions
  const saveResultsToApi = async () => {
    if (!results) return;

    const requestData = {
      idTopic: topicId,
      time: totalTime,
      listCorrectWord: correctWords,
      listIncorrectWord: incorrectWords,
    };

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/topic-history/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to save results');
      fetchLatestResults();
    } catch (error) {
      console.error('Error saving results:', error);
      fetchLatestResults();
    }
  };

  const fetchLatestResults = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}:3001/api/v1/topic-history/topic/${topicId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) throw new Error('Failed to fetch topic history');
  
      const data = await response.json();
  
      const maxCorrectAnswers = data.reduce((max, item) => {
        return Math.max(max, item.correctWord?.length || 0);
      }, 0);

      setMaxCorrectAnswers(maxCorrectAnswers);
  
      const latestHistory = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
  
      if (latestHistory) {
        setDetailedWords({
          correct: latestHistory.correctWord || [],
          incorrect: latestHistory.incorrectWord || [],
        });
  
        setCorrects(latestHistory.correctWord || []);
        setInCorrects(latestHistory.incorrectWord || []);
  
        if (!results) {
          const totalWords =
            (latestHistory.correctWord || []).length +
            (latestHistory.incorrectWord || []).length;
          const progressValue = latestHistory.correctWord.length / totalWords;
  
          progressAnimation.addListener(({ value }) => {
            setProgress(value);
          });
  
          Animated.timing(progressAnimation, {
            toValue: progressValue,
            duration: 1500,
            useNativeDriver: false,
          }).start();
        }
      }
  
      // Log hoặc sử dụng maxCorrectAnswers
      console.log('Max Correct Answers:', maxCorrectAnswers);
    } catch (error) {
      console.error('Error fetching latest topic history:', error);
    } finally {
      setLoading(false);
    }
  };
  

  // Effects
  useEffect(() => {
    if (results) {
      saveResultsToApi();
    } else {
      fetchLatestResults();
    }
  }, [results, correctWords, incorrectWords, topicId, totalTime]);

  useEffect(() => {
    const getDetailedWords = () => {
      const correct = uniqueWords
        .filter(wordId => correctWords.includes(wordId))
        .map(wordId => {
          const wordResult = results.find(r => r.currentIdQuestion === wordId);
          return {
            word: wordResult.word,
            meaning: wordResult.meaning,
            id: wordId,
          };
        });
    
      const incorrect = uniqueWords
        .filter(wordId => incorrectWords.includes(wordId))
        .map(wordId => {
          const wordResult = results.find(r => r.currentIdQuestion === wordId);
          return {
            word: wordResult.word,
            meaning: wordResult.meaning,
            id: wordId,
          };
        });
    
      setDetailedWords({
        correct: [...new Set(correct.map(JSON.stringify))].map(JSON.parse),
        incorrect: [...new Set(incorrect.map(JSON.stringify))].map(JSON.parse),
      });
      setLoading(false);
    };
  
    if (results) {
      getDetailedWords();
    }
  }, [results, correctWords, incorrectWords, uniqueWords]);

  // Handler Functions
  const handleNavigateHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainAppNavigator' }],
      })
    );
  };

  const handleSpeak = async (audioUri) => {
    if (audioUri) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
  
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().catch((err) => 
              console.error("Error unloading sound:", err)
            );
          }
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleNavigateTest = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'VocabTestScreen', params: { topicId: topicId } }],
      })
    );
  };

  const handleNavigateLearn = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'VocabLearnScreen', params: { topicId: topicId } }],
      })
    );
  };

  // Render Functions
  const renderWordDetails = (words, type, currentPage, setCurrentPage) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentWords = words.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
    return (
      <View style={styles.wordListCard}>
        <View style={styles.wordListHeader}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>
              {type === 'correct' ? '✅' : '❌'}
            </Text>
          </View>
          <Text style={styles.wordListTitle}>
            {type === 'correct' ? 'Correct Words' : 'Incorrect Words'}
            <Text style={styles.wordCount}> ({words.length})</Text>
          </Text>
        </View>
  
        {currentWords.map((item, index) => (
          <View
            key={`${item.id}-${index}`}
            style={[
              styles.wordItem,
              index % 2 === 0 ? styles.evenItem : styles.oddItem,
            ]}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.wordThumbnail}
              resizeMode="cover"
            />
            <View style={styles.wordDetails}>
              <Text style={styles.wordText}>{item.word}</Text>
              <View style={styles.wordMetaContainer}>
                <View style={styles.wordClassContainer}>
                  <Text style={styles.wordClass}>{item.wordClass}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSpeak(item.audio)}
                  style={styles.audioButton}
                >
                  <FontAwesome name="volume-up" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              <Text style={styles.translate}>{item.translate}</Text>
            </View>
          </View>
        ))}

        <View style={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            totalItems={words.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </View>
      </View>
    );
  };

  const renderProgressStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Correct</Text>
        <Text style={styles.statValue}>{correctAnswers}</Text>
        <Text style={styles.statSubtext}>vocabulary</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Incorrect</Text>
        <Text style={styles.statValue}>{incorrectAnswers}</Text>
        <Text style={styles.statSubtext}>vocabulary</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Test Results</Text>
          <Text style={styles.subtitle}>Topic: {topicName}</Text>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.progressContainer}>
            <ProgressCircle
              progress={progress}
              size={180}
              strokeWidth={15}
              progressColor="#4CAF50"
              backgroundColor="#E8F5E9"
            />
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressPercentage}>
                {Math.round((correctAnswers / totalQuestion) * 100)}%
              </Text>
              <Text style={styles.progressLabel}>Completed</Text>
            </View>
          </View>
          {renderProgressStats()}
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Learning Progress</Text>
          <LineChart
            data={{
              labels: ['0', 'Best Score', 'Current Score'],
              datasets: [{ data: [0, maxCorrectAnswers, correctAnswers] }],
            }}
            width={width - 60}
            height={180}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {!loading && (
          <>
            {detailedWords.correct.length > 0 &&
              renderWordDetails(
                detailedWords.correct,
                'correct',
                correctCurrentPage,
                setCorrectCurrentPage
              )}
            {detailedWords.incorrect.length > 0 &&
              renderWordDetails(
                detailedWords.incorrect,
                'incorrect',
                incorrectCurrentPage,
                setIncorrectCurrentPage
              )}
          </>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.reviewButton]} 
            onPress={handleNavigateLearn}
          >
            <Text style={styles.reviewButtonText}>Learn Again</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.retryButton]} 
            onPress={handleNavigateTest}
          >
            <Text style={styles.retryButtonText}>Retake Test</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={handleNavigateHome}
          >
            <Text style={styles.retryButtonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    height: 180,
    width: 180,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  statSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  messageIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 30,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: '#1A237E',
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  backButton: {
    backgroundColor: '#FFC107',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  wordListContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  wordListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  wordListCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  wordListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerIconContainer: {
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  wordListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  wordCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  evenItem: {
    backgroundColor: '#FFFFFF',
  },
  oddItem: {
    backgroundColor: '#FAFAFA',
  },
  wordThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  wordDetails: {
    flex: 1,
    marginLeft: 16,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 6,
  },
  wordMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  wordClassContainer: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  wordClass: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  translate: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  audioButton: {
    padding: 6,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
  },
});

export default VocabResultScreen;