import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNavigation, QuestionOptions } from '../components/QuestionTest';

const { height } = Dimensions.get('window');

const TestPart3 = () => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const scrollViewRef = useRef(null);
  
  // Mảng chứa các file audio
  const audioFiles = [
    'http://192.168.100.101:8081/assets/audio/test_audio_1.mp3', // cho câu 1, 2, 3
    'http://192.168.100.101:8081/assets/audio/test_audio_2.mp3', // cho câu 4, 5, 6...
    // thêm các audio khác nếu cần
  ];

  const questionGroups = [
    {
      id: 1,
      questions: [
        {
          id: 1,
          audio: { uri: audioFiles[0] }, // Gán audio cho câu 1
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
        {
          id: 2,
          audio: { uri: audioFiles[0] }, // Gán audio cho câu 2
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
        {
          id: 3,
          audio: { uri: audioFiles[0] }, // Gán audio cho câu 3
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
        {
          id: 4,
          audio: { uri: audioFiles[1] }, // Gán audio cho câu 4
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
        {
          id: 5,
          audio: { uri: audioFiles[1] }, // Gán audio cho câu 5
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
          },
          options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
        },
        {
          id: 6,
          audio: { uri: audioFiles[1] }, // Gán audio cho câu 6
          image: {
            uri: 'http://192.168.100.101:8081/assets/images/Test/test_sentence.png',
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

  let lastAudioUri = null;

  return (
    <SafeAreaView style={styles.container}>
      <QuestionNavigation
        questions={questionGroups[0].questions}
        questionStatus={questionStatus}
        onQuestionPress={handleQuestionPress}
      />

      <ScrollView ref={scrollViewRef} style={styles.questionContainer}>
        {questionGroups[0].questions.map((question) => {
          const showAudioPlayer = question.audio.uri !== lastAudioUri;
          if (showAudioPlayer) {
            lastAudioUri = question.audio.uri;
          }

          return (
            <View key={question.id} style={styles.questionWrapper}>
              {showAudioPlayer && (
                <AudioPlayer audioUri={question.audio.uri} questionId={question.id} />
              )}
              <Text style={styles.questionTitle}>Question {question.id}</Text>
              <Image source={question.image} style={styles.questionImage} resizeMode="contain" />
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
          );
        })}
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
  questionImage: {
    width: '100%',
    height: height * 0.25,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default TestPart3;
