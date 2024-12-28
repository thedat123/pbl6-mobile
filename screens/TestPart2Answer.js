import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import AudioPlayer from '../components/AudioPlayer';

const { height } = Dimensions.get('window');

const TestPart2Answer = ({ navigation, route }) => {
  const [answerData, setAnswerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { testId } = route.params;

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined. Please check your .env configuration.');
      setError('Configuration Error: Unable to connect to server');
      return;
    }

    const fetchAnswerData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
        if (response.status === 200) {
          const testData = response.data;

          const part2Questions = testData.groupQuestions.filter(
            group => group.part?.key === 'part2'
          );

          const transformedAnswers = part2Questions.map(group => ({
            id: group.id,
            questions: group.questions.map(q => ({
              id: q.id,
              questionNumber: q.questionNumber,
              audio: group.questionMedia?.find(media => media.type === 'audio')?.url,
              correctAnswer: q.correctAnswer,
              explain: q.explain || 'No explanation provided.',
              answerOptions: q.answer,
            })),
          }));

          setAnswerData(transformedAnswers);
          setIsLoading(false);
        } else {
          throw new Error('Failed to fetch answer data');
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchAnswerData();
  }, [testId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading answer data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setIsLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.answerContainer} showsVerticalScrollIndicator={false}>
        {answerData.map(group =>
          group.questions.map(question => (
            <View key={question.id} style={styles.questionWrapper}>
              <QuestionNumber number={question.questionNumber} />
              {question.audio && (
                <AudioPlayer 
                  audioUri={question.audio} 
                  questionId={question.id} 
                />
              )}
              <QuestionOptions
                question={{
                  options: question.answerOptions.map((option, index) => ({
                    label: String.fromCharCode(65 + index),
                    text: option,
                    isCorrect: question.correctAnswer === String.fromCharCode(65 + index),
                  })),
                  correctAnswer: question.correctAnswer,
                }}
                selectedAnswer={question.correctAnswer}
              />
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{question.explain}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  answerContainer: {
    flex: 1,
    padding: 16,
  },
  questionWrapper: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    elevation: 1,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#555555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default TestPart2Answer;
