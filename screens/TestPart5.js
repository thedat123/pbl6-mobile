import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const TestPart5 = forwardRef(({ onQuestionStatusChange, testId, onQuestionLayout, questionRefs }, ref) => {
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
      setIsLoading(false);
      return;
    }

    fetchTestPartData();
  }, []);

  const fetchTestPartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);

      if (response.status === 200) {
        const testData = response.data;

        const part5Questions = testData.groupQuestions.filter(
          group => group.part?.key === 'part5'
        );

        const transformedQuestions = part5Questions.map(group => ({
          id: group.id,
          questions: group.questions.map(q => ({
            id: q.id,
            questionNumber: q.questionNumber,
            question: q.question,
            options: q.answer.map((answer, index) => ({
              label: String.fromCharCode(65 + index),
              text: answer,
              isCorrect: q.correctAnswer === answer,
            })),
            correctAnswer: q.correctAnswer,
            explain: q.explain,
          })).sort((a, b) => a.questionNumber - b.questionNumber),
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

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));

    const newStatus = {
      [questionId]: option ? 'answered' : 'viewed',
    };

    setQuestionStatus(prev => ({
      ...prev,
      ...newStatus,
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
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
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
              <Text style={styles.questionText}>{question.question}</Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  questionContainer: { padding: 16, marginBottom: 24 },
  questionText: { fontSize: 18, marginBottom: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 16 },
  retryButton: { padding: 10, backgroundColor: '#2196F3', borderRadius: 5 },
  retryButtonText: { color: '#FFFFFF' },
});

export default TestPart5;
