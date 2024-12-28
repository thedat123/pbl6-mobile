import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const { height } = Dimensions.get('window');

const TestPart1Answer = ({ navigation, route }) => {
  const { testId } = route.params;
  const [questionData, setQuestionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestPartData = async () => {
    try {
      console.log(testId);
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
      if (response.status === 200) {
        const testData = response.data;       

        const part1Questions = testData.groupQuestions.filter(
          group => group.part?.key === 'part1'
        );

        const transformedQuestions = part1Questions.map(group => ({
            id: group.id,
            detail: group.detail,
            transcript: group.transcript,
            describeAnswer: group.describeAnswer,
            questions: group.questions
              .map(q => ({
                id: q.id,
                questionNumber: q.questionNumber,
                audio: group.questionMedia?.find(media => media.type === 'audio')?.url,
                image: group.questionMedia?.find(media => media.type === 'image')?.url,
                options: [
                  { label: 'A', text: q.answer[0], isCorrect: q.correctAnswer === 'A' },
                  { label: 'B', text: q.answer[1], isCorrect: q.correctAnswer === 'B' },
                  { label: 'C', text: q.answer[2], isCorrect: q.correctAnswer === 'C' },
                  { label: 'D', text: q.answer[3], isCorrect: q.correctAnswer === 'D' }
                ],
                correctAnswer: q.correctAnswer,
                explain: q.explain,
              }))
              .sort((a, b) => a.questionNumber - b.questionNumber),
        }));
          

        setQuestionData(transformedQuestions);
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
  }, []);

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
          onPress={fetchTestPartData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.questionContainer}>
        {questionData.map(group => (
          <View key={group.id} style={styles.groupWrapper}>
            {group.detail && (
              <Text style={styles.groupDetail}>
                <Text style={styles.label}>Detail:</Text> {group.detail}
              </Text>
            )}
            {group.transcript && (
              <Text style={styles.groupTranscript}>
                <Text style={styles.label}>Transcript:</Text> {group.transcript}
              </Text>
            )}
            {group.describeAnswer && (
              <Text style={styles.groupDescribe}>
                <Text style={styles.label}>Description:</Text> {group.describeAnswer}
              </Text>
            )}
  
            {group.questions.map(question => (
              <View key={question.id} style={styles.questionWrapper}>
                <QuestionNumber number={question.questionNumber} />
                
                {question.audio && (
                  <AudioPlayer audioUri={question.audio} questionId={question.id} />
                )}
  
                {question.image && (
                  <Image
                    source={{ uri: question.image }}
                    style={styles.questionImage}
                    resizeMode="contain"
                  />
                )}
  
                <QuestionOptions
                  question={question}
                  selectedAnswer={question.correctAnswer} 
                  isReadOnly
                />
  
                {question.explain && (
                  <Text style={styles.explainText}>
                    <Text style={styles.explainTitle}>Explanation:</Text> {question.explain}
                  </Text>
                )}
              </View>
            ))}
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
  questionImage: {
    width: '100%',
    height: height * 0.25,
    borderRadius: 8,
    marginVertical: 10,
  },
  explainText: {
    fontSize: 14,
    marginTop: 8,
    color: '#555',
  },
  explainTitle: {
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default TestPart1Answer;
