import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, ScrollView, Animated } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { LineChart } from 'react-native-chart-kit';
import { useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const VocabResultScreen = ({ route }) => {
  const { results, totalQuestions, topicId, topicName, totalTime } = route.params;
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const progressAnimation = useMemo(() => new Animated.Value(0), []);

  const uniqueWords = Array.isArray(results) ? [...new Set(results.map(r => r.currentIdQuestion))] : [];

  const correctWords = uniqueWords.filter(wordId =>
    results
      .filter(r => r.currentIdQuestion === wordId)
      .every(r => r.isCorrect)
  );

  const incorrectWords = uniqueWords.filter(wordId => !correctWords.includes(wordId));

  const correctAnswers = correctWords.length;
  const incorrectAnswers = incorrectWords.length;
  const maxCorrectAnswers = correctAnswers;

  const [history, setHistory] = useState([]);
  const [historyId, setHistoryId] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(results);
    console.log("=====================================");
    const targetProgress = maxCorrectAnswers / (totalQuestions / 2); 
    progressAnimation.addListener(({ value }) => {
      setProgress(value);
    });

    Animated.timing(progressAnimation, {
      toValue: targetProgress,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    return () => progressAnimation.removeAllListeners();
  }, [progressAnimation, maxCorrectAnswers]);

  useEffect(() => {
    const saveResultsToApi = async () => {
      const requestData = {
        idTopic: topicId,
        time: totalTime,
        listCorrectWord: [...new Set(correctWords)],
        listIncorrectWord: [...new Set(incorrectWords)],
      };

      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}:3001/api/v1/topic-history/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error('Failed to save results');
      const data = await response.json();
      setHistoryId(data.id);

      await AsyncStorage.setItem('latestVocabResults', JSON.stringify({
        correctWords,
        incorrectWords,
        totalTime,
        results,
      }));
    };

    saveResultsToApi();
  }, [correctWords, results, topicId, totalTime]);

  useEffect(() => {
    if (historyId) {
      const fetchDetailedResults = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(
            `${API_BASE_URL}:3001/api/v1/topic-history/${historyId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (!response.ok) throw new Error('Failed to fetch detailed results');
          const data = await response.json();
          setDetailedResult(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching detailed results:', error);
        }
      };

      fetchDetailedResults();
    }
  }, [historyId]);

  const handleNavigateHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainAppNavigator' }],
      })
    );
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

  const bestScore = useMemo(() => Math.max(...history, 0), [history]);
  const chartData = [0, bestScore, maxCorrectAnswers];

  const renderProgressStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Words Learned</Text>
        <Text style={styles.statValue}>{correctAnswers}</Text>
        <Text style={styles.statSubtext}>vocabulary</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Words Not Learned</Text>
        <Text style={styles.statValue}>{incorrectAnswers}</Text>
        <Text style={styles.statSubtext}>vocabulary</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Results</Text>
          <Text style={styles.subtitle}>Topic: {topicName}</Text>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.progressContainer}>
            <ProgressCircle
              style={styles.progressCircle}
              progress={progress}
              progressColor={'#4CAF50'}
              backgroundColor={'#E8F5E9'}
              strokeWidth={15}
            />
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressPercentage}>{Math.round((maxCorrectAnswers / (totalQuestions / 2)) * 100)}%</Text>
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
              datasets: [{ data: chartData }],
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

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.button, styles.reviewButton]} onPress={handleNavigateLearn}>
            <Text style={styles.reviewButtonText}>Learn Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={handleNavigateTest}>
            <Text style={styles.retryButtonText}>Retake Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleNavigateHome}>
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
});

export default VocabResultScreen;