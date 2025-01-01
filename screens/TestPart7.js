import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import axios from 'axios';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import { API_BASE_URL } from '@env';

const TestPart7 = forwardRef(({ onQuestionStatusChange, testId, onQuestionLayout, questionRefs }, ref) => {
  const [questionData, setQuestionData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const groupRefs = useRef({});

  const fetchTestPartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
      if (response.status === 200) {
        const testData = response.data;

        const part7Questions = testData.groupQuestions.filter(group => group.part?.key === 'part7');

        const transformedQuestions = part7Questions.map(group => ({
          id: group.id,
          imageUrl: group.image[0]?.url || null,
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
    fetchTestPartData();
  }, [testId]);

  const measureQuestionPosition = (groupId, questionId, event) => {
    if (!groupRefs.current[groupId]) {
      groupRefs.current[groupId] = { position: 0, questions: {} };
    }

    const layout = event.nativeEvent.layout;
    groupRefs.current[groupId].questions[questionId] = layout.y;

    const absolutePosition = groupRefs.current[groupId].position + layout.y;
    if (onQuestionLayout) {
      onQuestionLayout(questionId, { nativeEvent: { layout: { y: absolutePosition } } });
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
        onQuestionLayout(questionId, { nativeEvent: { layout: { y: absolutePosition } } });
      }
    });
  };

  const handleSelectAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    const newStatus = { [questionId]: option ? 'answered' : 'viewed' };
    setQuestionStatus(prev => ({ ...prev, ...newStatus }));
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchTestPartData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {questionData.map(group => (
          <View
            key={group.id}
            style={styles.groupWrapper}
            onLayout={event => measureGroupPosition(group.id, event)}
          >
            {group.imageUrl && (
              <TouchableOpacity style={styles.imageContainer}>
                <Image source={{ uri: group.imageUrl }} style={styles.image} resizeMode="contain" />
              </TouchableOpacity>
            )}
            {group.questions.map(question => (
              <View
                key={question.id}
                style={styles.questionWrapper}
                onLayout={event => measureQuestionPosition(group.id, question.id, event)}
              >
                <QuestionNumber number={question.questionNumber} />
                <QuestionOptions
                  question={{ id: question.id, question: question.question, options: question.options }}
                  selectedAnswer={answers[question.id]}
                  onAnswerSelect={handleSelectAnswer}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  questionBlock: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 12,
    elevation: 5,
  },
  imageContainer: { height: 250, backgroundColor: '#f8f8f8' },
  image: { width: '100%', height: '100%' },
  questionContainer: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 16 },
  retryButton: { padding: 10, backgroundColor: '#2196F3', borderRadius: 5 },
  retryButtonText: { color: '#FFFFFF' },
});

export default TestPart7;
