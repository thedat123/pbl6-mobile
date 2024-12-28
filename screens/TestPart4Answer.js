import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import RenderHtml from 'react-native-render-html';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const ExplanationCard = ({ content }) => {
  const source = {
    html: content,
  };

  return (
    <View style={styles.explanationCard}>
      <Text style={styles.explanationTitle}>Explanation</Text>
      <View style={styles.explanationContent}>
        <RenderHtml
          contentWidth={width - 64} // Account for padding
          source={source}
          tagsStyles={{
            p: {
              fontSize: 15,
              lineHeight: 24,
              color: '#4A4A4A',
              marginBottom: 8,
            },
            strong: {
              color: '#2C3E50',
            },
            ul: {
              marginLeft: 16,
            },
            li: {
              marginBottom: 4,
            },
          }}
        />
      </View>
    </View>
  );
};

const TestPart4Answer = ({ navigation, route }) => {
  const [answerData, setAnswerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { testId } = route.params;

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined. Please check your .env configuration.');
      setError('Configuration Error: Unable to connect to server');
      return;
    }

    const fetchAnswerData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
        if (response.status === 200) {
          const part4Questions = response.data.groupQuestions
            .filter(group => group.part?.key === 'part4')
            .map(group => ({
              id: group.id,
              audio: group.questionMedia?.find(media => media.type === 'audio')?.url,
              questions: group.questions.map(q => {
                const options = q.answer.map((text, index) => ({
                  label: String.fromCharCode(65 + index),
                  text,
                  isCorrect: text === q.correctAnswer,
                }));
                
                const correctOption = options.find(option => option.isCorrect);
                
                return {
                  id: q.id,
                  questionNumber: q.questionNumber,
                  question: q.question,
                  options,
                  correctAnswer: correctOption?.label || null,
                  explain: q.explain || 'No explanation provided.',
                };
              }),
            }));
    
          setAnswerData(part4Questions);
          setIsLoading(false);
        } else {
          throw new Error('Failed to fetch answer data');
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };    

    fetchAnswerData();
  }, [testId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading answer data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setIsLoading(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.answerContainer} showsVerticalScrollIndicator={false}>
        {answerData.map(group => (
          <View key={group.id} style={styles.groupWrapper}>
            {group.questions.map(question => (
              <View key={question.id} style={styles.questionWrapper}>
                <QuestionNumber number={question.questionNumber} />
                <Text style={styles.questionText}>{question.question}</Text>
                <QuestionOptions
                  question={{
                    id: question.id,
                    options: question.options,
                  }}
                  selectedAnswer={question.correctAnswer}
                />
                <ExplanationCard content={question.explain} />
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
  answerContainer: {
    flex: 1,
    padding: 16,
  },
  groupWrapper: {
    marginBottom: 24,
  },
  questionWrapper: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  explanationCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  explanationContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
});

export default TestPart4Answer;
