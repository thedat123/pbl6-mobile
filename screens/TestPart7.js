import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import axios from 'axios';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import { API_BASE_URL } from '@env';

const TestPart7 = forwardRef(({ onQuestionStatusChange, testId }, ref) => {
  const [questionData, setQuestionData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const fetchTestPartData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/test/${testId}`);
      if (response.status === 200) {
        const testData = response.data;

        const part7Questions = testData.groupQuestions.filter(group => group.part?.key === 'part7');

        const transformedQuestions = part7Questions.map(group => ({
          imageUrl: group.imageUrl, // Replace with correct property from your API
          questions: group.questions.map(q => ({
            id: q.id,
            questionText: q.question,
            options: q.answer.map((answer, index) => ({
              label: String.fromCharCode(65 + index),
              text: answer,
              isCorrect: q.correctAnswer === answer,
            })),
            correctAnswer: q.correctAnswer,
          })),
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

  const handleSelectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    const newStatus = { [questionId]: option ? 'answered' : 'viewed' };
    setQuestionStatus((prev) => ({ ...prev, ...newStatus }));
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

  const openImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchTestPartData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {questionData.map((item, index) => (
          <View key={index} style={styles.questionBlock}>
            <TouchableOpacity onPress={() => openImageViewer(item.imageUrl)} style={styles.imageContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
            </TouchableOpacity>
            {item.questions.map((question) => (
              <View key={question.id} style={styles.questionContainer}>
                <QuestionNumber number={question.id} />
                <QuestionOptions
                  question={{ id: question.id, question: question.questionText, options: question.options }}
                  selectedAnswer={answers[question.id]}
                  onAnswerSelect={handleSelectAnswer}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <ImageViewing
        images={[{ uri: selectedImage }]}
        imageIndex={0}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
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
