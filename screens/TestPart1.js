import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNavigation, QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const { height } = Dimensions.get('window');

const TestPart1 = forwardRef((props, ref) => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const scrollViewRef = useRef(null);
  
  const questionData = [
    {
      id: 1,
      questions: [
        {
          id: 1,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: [
            { label: 'A', text: 'Statement A' },
            { label: 'B', text: 'Statement B' },
            { label: 'C', text: 'Statement C' },
            { label: 'D', text: 'Statement D' },
          ],
        },
        {
          id: 2,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: [
            { label: 'A', text: 'Statement A' },
            { label: 'B', text: 'Statement B' },
            { label: 'C', text: 'Statement C' },
            { label: 'D', text: 'Statement D' },
          ],
        },
        {
          id: 3,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: [
            { label: 'A', text: 'Statement A' },
            { label: 'B', text: 'Statement B' },
            { label: 'C', text: 'Statement C' },
            { label: 'D', text: 'Statement D' },
          ],
        },
      ],
    },
  ];  

  const handleAnswerSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setQuestionStatus((prev) => ({ ...prev, [questionId]: 'answered' }));
  };

  const handleQuestionPress = (questionId) => {
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: 'viewed'
    }));
  };

  useImperativeHandle(ref, () => ({
    getQuestionData: () => questionData,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.questionContainer}>
        {questionData[0].questions.map((question) => (
          <View key={question.id} style={styles.questionWrapper}>
            <QuestionNumber number={question.id} />
            <AudioPlayer audioUri={question.audio.uri} questionId={question.id} />
            <Image source={question.image} style={styles.questionImage} resizeMode="contain" />
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
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionWrapper: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  questionImage: {
    width: '100%',
    height: height * 0.25,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default TestPart1;