import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const TestPart2 = forwardRef(({ onQuestionStatusChange }, ref) => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [startTime, setStartTime] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);
  
  const questionData = [
    {
      id: 1,
      questions: [
        {
          id: 1,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          options: [
            { label: 'A', text: 'Statement A', isCorrect: true },
            { label: 'B', text: 'Statement B', isCorrect: false },
            { label: 'C', text: 'Statement C', isCorrect: false },
            { label: 'D', text: 'Statement D', isCorrect: false },
          ],
          correctAnswer: 'A'
        },
        {
          id: 2,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          options: [
            { label: 'A', text: 'Statement A', isCorrect: true },
            { label: 'B', text: 'Statement B', isCorrect: false },
            { label: 'C', text: 'Statement C', isCorrect: false },
            { label: 'D', text: 'Statement D', isCorrect: false },
          ],
          correctAnswer: 'A'
        },
        {
          id: 3,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          options: [
            { label: 'A', text: 'Statement A', isCorrect: true },
            { label: 'B', text: 'Statement B', isCorrect: false },
            { label: 'C', text: 'Statement C', isCorrect: false },
            { label: 'D', text: 'Statement D', isCorrect: false },
          ],
          correctAnswer: 'A'
        },
      ],
    },
  ];

  const handleAnswerSelect = (questionId, option) => {
    setAnswers((prev) => ({ 
      ...prev, 
      [questionId]: option 
    }));
    
    const newStatus = { 
      [questionId]: option ? 'answered' : 'viewed' 
    };
    
    setQuestionStatus((prev) => ({ 
      ...prev, 
      ...newStatus 
    }));
    
    if (onQuestionStatusChange) {
      onQuestionStatusChange(newStatus);
    }
  };

  useImperativeHandle(ref, () => ({
    getQuestionData: () => questionData,
    getQuestionStatus: () => questionStatus,
    getAnswers: () => answers,
    getTestDuration: () => {
      return Math.floor((Date.now() - startTime) / 1000);
    }
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {questionData[0].questions.map((question) => (
          <View key={question.id} style={styles.questionWrapper}>
            <QuestionNumber number={question.id} />
            <AudioPlayer audioUri={question.audio.uri} questionId={question.id} />
            <QuestionOptions
              question={question}
              selectedAnswer={answers[question.id]}
              onAnswerSelect={handleAnswerSelect}
            />
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
  questionWrapper: {
    marginBottom: 16,
  },
});

export default TestPart2;
