import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Image, StyleSheet, SafeAreaView, ScrollView, Dimensions, Text } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const { height } = Dimensions.get('window');

const audioFiles = [
  'http://192.168.100.101:8081/assets/audio/test_audio_1.mp3',
  'http://192.168.100.101:8081/assets/audio/test_audio_2.mp3',
];

const questionData = [
  {
    id: 1,
    questions: [
      {
        id: 1,
        audio: { uri: audioFiles[0] },
        image: { uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png' },
        options: [
          { label: 'A', text: 'Statement A' },
          { label: 'B', text: 'Statement B' },
          { label: 'C', text: 'Statement C' },
          { label: 'D', text: 'Statement D' },
        ],
      },
      {
        id: 2,
        audio: { uri: audioFiles[0] },
        image: { uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png' },
        options: [
          { label: 'A', text: 'Statement A' },
          { label: 'B', text: 'Statement B' },
          { label: 'C', text: 'Statement C' },
          { label: 'D', text: 'Statement D' },
        ],
      },
      {
        id: 3,
        audio: { uri: audioFiles[0] },
        image: { uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png' },
        options: [
          { label: 'A', text: 'Statement A' },
          { label: 'B', text: 'Statement B' },
          { label: 'C', text: 'Statement C' },
          { label: 'D', text: 'Statement D' },
        ],
      },
      {
        id: 4,
        audio: { uri: audioFiles[1] },
        image: { uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png' },
        options: [
          { label: 'A', text: 'Statement A' },
          { label: 'B', text: 'Statement B' },
          { label: 'C', text: 'Statement C' },
          { label: 'D', text: 'Statement D' },
        ],
      },
      {
        id: 5,
        audio: { uri: audioFiles[1] },
        image: { uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png' },
        options: [
          { label: 'A', text: 'Statement A' },
          { label: 'B', text: 'Statement B' },
          { label: 'C', text: 'Statement C' },
          { label: 'D', text: 'Statement D' },
        ],
      },
      {
        id: 6,
        audio: { uri: audioFiles[1] },
        image: { uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png' },
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

const TestPart3 = forwardRef((props, ref) => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});

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
        <View style={styles.contentWrapper}>
          {questionData[0].questions.map((question, index) => {
            const showAudioPlayer = index === 0 || question.audio.uri !== questionData[0].questions[index - 1].audio.uri;

            return (
              <View key={question.id} style={styles.questionContainer}>
                {showAudioPlayer && <AudioPlayer audioUri={question.audio.uri} questionId={question.id} />}
                <QuestionNumber number={question.id} />
                <Image source={question.image} style={styles.questionImage} resizeMode="contain" />
                <View style={styles.questionOptionsContainer}>
                  <Text style={styles.questionText}>Choose an option:</Text>
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
    marginBottom: 8,
  },
});

export default TestPart3;
