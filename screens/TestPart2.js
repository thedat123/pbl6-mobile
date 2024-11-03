import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNavigation, QuestionOptions } from '../components/QuestionTest';

const { height } = Dimensions.get('window');

const TestPart2 = () => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const scrollViewRef = useRef(null);
  
  const questionGroups = [
    {
      id: 1,
      questions: [
        {
          id: 1,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
        {
          id: 2,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
        {
          id: 3,
          audio: {
            uri: 'http://192.168.100.101:8081/assets/audio/test_audio.mp3',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
      ],
    },
  ];

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: 'answered'
    }));
  };

  const handleQuestionPress = (questionId) => {
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: 'viewed'
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <QuestionNavigation
        questions={questionGroups[0].questions}
        questionStatus={questionStatus}
        onQuestionPress={handleQuestionPress}
      />

      <ScrollView ref={scrollViewRef} style={styles.questionContainer}>
        {questionGroups[0].questions.map((question) => (
          <View key={question.id} style={styles.questionWrapper}>
            <Text style={styles.questionTitle}>Question {question.id}</Text>
            <AudioPlayer audioUri={question.audio.uri} questionId={question.id} />
            <QuestionOptions
              question={{
                id: question.id,
                options: question.options.map((text, index) => ({
                  label: String.fromCharCode(65 + index),
                  text
                }))
              }}
              selectedAnswer={answers[question.id]}
              onAnswerSelect={handleAnswerSelect}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

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
});

export default TestPart2;