import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Image, StyleSheet, SafeAreaView, ScrollView, Dimensions, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import { API_BASE_URL } from '@env';
import axios from 'axios';

const { height } = Dimensions.get('window');

const TestPart4 = forwardRef(({ onQuestionStatusChange, testId, onQuestionLayout, questionRefs }, ref) => {
  const [questionData, setQuestionData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const groupRefs = useRef({});

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

        const part4Questions = testData.groupQuestions.filter(
          group => group.part?.key === 'part4'
        );

        const transformedQuestions = part4Questions.map(group => ({
          id: group.id,
          audioUrl: group.questionMedia && group.questionMedia.length > 0 ? group.questionMedia[0].url : null,
          questions: group.questions.map(q => {
            return {
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
              image: q.image?.[0] || null,
            };
          }).sort((a, b) => a.questionNumber - b.questionNumber)
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
  
      // Recalculate all questions in this group
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
        {questionData.map(group => (
          <View 
            key={group.id} 
            style={styles.groupWrapper}
            onLayout={(event) => measureGroupPosition(group.id, event)}
          >
            {group.audioUrl && (
              <AudioPlayer audioUri={group.audioUrl} questionId={group.id} />
            )}
  
            {group.questions.map((question, index) => {  
              return (
                <View 
                  key={question.id} 
                  style={styles.questionWrapper}
                  onLayout={(event) => measureQuestionPosition(group.id, question.id, event)}
                  ref={el => {
                    if (questionRefs && questionRefs.current) {
                      questionRefs.current[question.id] = el;
                    }
                  }}
                >
                  <View style={styles.questionWrapperChild}>
                    <QuestionNumber number={question.questionNumber} />
                    <Text style={styles.questionText}>{question.question}</Text>
                  </View>

                  {question.image && (
                    <Image source={{ uri: question.image }} style={styles.questionImage} resizeMode="contain" />
                  )}
    
                  <View style={styles.questionOptionsContainer}>
                    <QuestionOptions
                      question={question}
                      selectedAnswer={answers[question.id]}
                      onAnswerSelect={handleAnswerSelect}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentWrapper: {
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionImage: {
    width: '100%',
    height: height * 0.25,
    borderRadius: 8,
    marginVertical: 10,
  },
  questionOptionsContainer: {
    marginTop: 16,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
    marginLeft: 8,
  },
  questionWrapperChild: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
});

export default TestPart4;
