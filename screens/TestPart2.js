import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNavigation, QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const { height } = Dimensions.get('window');

const TestPart2 = forwardRef(({ onQuestionStatusChange, testId, onQuestionLayout, questionRefs }, ref) => {
  const [questionData, setQuestionData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);

  const fetchTestPartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
      
      if (response.status === 200) {
        const testData = response.data;

        const part2Questions = testData.groupQuestions.filter(
          group => group.part?.key === 'part2'
        );

        const transformedQuestions = part2Questions.map(group => ({
          id: group.id,
          questions: group.questions.map(q => ({
            id: q.id,
            questionNumber: q.questionNumber,
            audio: group.questionMedia?.find(media => media.type === 'audio')?.url,
            options: [
              { label: 'A', text: q.answer[0], isCorrect: q.correctAnswer === 'A' },
              { label: 'B', text: q.answer[1], isCorrect: q.correctAnswer === 'B' },
              { label: 'C', text: q.answer[2], isCorrect: q.correctAnswer === 'C' },
            ],
            correctAnswer: q.correctAnswer
          }))
          .sort((a, b) => a.questionNumber - b.questionNumber)
        }));

        setQuestionData(transformedQuestions);
        setStartTime(Date.now());
        setIsLoading(false);
      } else {
        throw new Error('Failed to fetch test data');
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestPartData();
  }, []);

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  
    const newStatus = {
      [questionId]: option ? 'answered' : 'viewed'
    };
  
    setQuestionStatus(prev => ({
      ...prev,
      ...newStatus
    }));
  
    if (onQuestionStatusChange) {
      onQuestionStatusChange(newStatus);
    }
  };

  useImperativeHandle(ref, () => ({
    getAnswers: () => answers,
    getQuestionStatus: () => questionStatus,
    getTestDuration: () => Math.floor((Date.now() - startTime) / 1000),
    getQuestionData: () => questionData,
  }));

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchTestPartData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Loading test data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        {questionData.map(group => 
          group.questions.map(question => (
            <View 
              key={question.id} 
              style={styles.questionWrapper}
              onLayout={(event) => onQuestionLayout(question.id, event)}
              ref={el => questionRefs.current[question.id] = el}
            >
              <QuestionNumber number={question.questionNumber} />
              
              {question.audio && (
                <AudioPlayer 
                  audioUri={question.audio} 
                  questionId={question.id} 
                />
              )}

              <QuestionOptions
                question={question}
                selectedAnswer={answers[question.id]}
                onAnswerSelect={handleAnswerSelect}
              />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionWrapper: {
    marginBottom: 16,
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

export default TestPart2;