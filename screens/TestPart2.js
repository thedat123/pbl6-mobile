import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const TestPart2 = forwardRef((props, ref) => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  
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

  useImperativeHandle(ref, () => ({
    getQuestionData: () => questionData,
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
