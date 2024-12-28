import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';
import RenderHtml from 'react-native-render-html';
import HTMLView from 'react-native-htmlview';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const ExplanationCard = ({ content = 'No explanation provided.' }) => {
  return (
    <View style={styles.explanationCard}>
      <Text style={styles.explanationTitle}>Explanation</Text>
      <View style={styles.explanationContent}>
        <HTMLView value={content} stylesheet={htmlStyles} />
      </View>
    </View>
  );
};

const TestPart6Answer = ({ navigation, route }) => {
  const [questionData, setQuestionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { testId } = route.params;

  useEffect(() => {
    if (!API_BASE_URL) {
      setError('Configuration Error: Unable to connect to server');
      setIsLoading(false);
      return;
    }

    const fetchTestPartData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
        if (response.status === 200) {
          const part6Questions = response.data.groupQuestions
            .filter(group => group.part?.key === 'part6')
            .map(group => ({
              id: group.id,
              title: group.title,
              detail: group.detail,
              transcript: group.transcript,
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
              }).sort((a, b) => a.questionNumber - b.questionNumber),
            }));

          setQuestionData(part6Questions);
          setIsLoading(false);
        } else {
          throw new Error('Failed to fetch test data');
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTestPartData();
  }, [testId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading test data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.answerContainer} showsVerticalScrollIndicator={false}>
        {questionData.map(passage => (
          <View key={passage.id} style={styles.groupWrapper}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{passage.title}</Text>
            </View>

            {passage.detail && (
              <View style={styles.detailContainer}>
                <Text style={styles.sectionLabel}>Reading Passage</Text>
                <HTMLView value={passage.detail} stylesheet={htmlStyles} />
              </View>
            )}

            {passage.transcript && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.sectionLabel}>Instructions</Text>
                <HTMLView value={passage.transcript} stylesheet={htmlStyles} />
              </View>
            )}

            {passage.questions.map(question => (
              <View key={question.id} style={styles.questionWrapper}>
                <QuestionNumber number={question.questionNumber} />
                <Text style={styles.questionText}>{question.question}</Text>
                <QuestionOptions
                  question={question}
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

const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 15,
    color: '#4A4A4A',
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
});

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
  titleContainer: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  detailContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  transcriptContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
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
    padding: 12,
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

export default TestPart6Answer;