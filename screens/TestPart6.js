import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import HTMLView from 'react-native-htmlview';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const TestPart6 = forwardRef(({ onQuestionStatusChange, testId, onQuestionLayout, questionRefs }, ref) => {
  const [questionData, setQuestionData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const groupRefs = useRef({});

  const renderHtmlContent = (htmlContent = {}) => {
    return (
      <HTMLView
        value={htmlContent}
        stylesheet={styles.detail}
      />
    );
  };

  const measureQuestionPosition = (groupId, questionId, event) => {
    if (!groupRefs.current[groupId]) {
      groupRefs.current[groupId] = { position: 0, questions: {} };
    }

    const layout = event.nativeEvent.layout;
    groupRefs.current[groupId].questions[questionId] = layout.y;

    const absolutePosition = groupRefs.current[groupId].position + layout.y;
    
    if (onQuestionLayout) {
      onQuestionLayout(questionId, { 
        nativeEvent: { 
          layout: { y: absolutePosition } 
        } 
      });
    }
  };

  const measureGroupPosition = (groupId, event) => {
    const layout = event.nativeEvent.layout;
    if (!groupRefs.current[groupId]) {
      groupRefs.current[groupId] = { position: 0, questions: {} };
    }
    groupRefs.current[groupId].position = layout.y;

    Object.entries(groupRefs.current[groupId].questions).forEach(([questionId, questionY]) => {
      const absolutePosition = layout.y + questionY;
      if (onQuestionLayout) {
        onQuestionLayout(questionId, { 
          nativeEvent: { 
            layout: { y: absolutePosition } 
          } 
        });
      }
    });
  };

  const fetchTestPartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
      if (response.status === 200) {
        const testData = response.data;

        const part6Questions = testData.groupQuestions.filter(
          group => group.part?.key === 'part6'
        );

        const transformedQuestions = part6Questions.map(group => ({
          id: group.id,
          title: group.title,
          detail: group.detail,
          transcript: group.transcript,
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

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined. Please check your .env configuration.');
      setError('Configuration Error: Unable to connect to server');
      setIsLoading(false);
      return;
    }

    fetchTestPartData();
  }, []);

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
        {questionData.map(passage => (
          <View 
            key={passage.id} 
            style={styles.groupWrapper}
            onLayout={(event) => measureGroupPosition(passage.id, event)}
          >
            <Text style={styles.title}>{passage.title}</Text>
            {passage.detail && renderHtmlContent(passage.detail)}
            {passage.questions.map(question => (
              <View 
                key={question.id} 
                style={styles.questionWrapper}
                onLayout={(event) => measureQuestionPosition(passage.id, question.id, event)}
                ref={el => {
                  if (questionRefs && questionRefs.current) {
                    questionRefs.current[question.id] = el;
                  }
                }}
              >
                <QuestionNumber number={question.questionNumber} />
                <QuestionOptions
                  question={question}
                  selectedAnswer={answers[question.id]}
                  onAnswerSelect={handleAnswerSelect}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  detail: {
    p: {
      fontSize: 16,
      color: '#333',
      lineHeight: 24,
      marginBottom: 16,
    },
    h1: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    a: {
      color: '#2196F3',
      textDecorationLine: 'underline',
    },
  },
  scrollView: { flex: 1 },
  questionContainer: { marginBottom: 24 },
  questionText: { fontSize: 18, marginBottom: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 16 },
  retryButton: { padding: 10, backgroundColor: '#2196F3', borderRadius: 5 },
  retryButtonText: { color: '#FFFFFF' },
  groupWrapper: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 20,
  },
  questionWrapper: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});

export default TestPart6;