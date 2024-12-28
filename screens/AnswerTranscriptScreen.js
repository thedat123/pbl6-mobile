import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { CheckCircle, BookOpen, ChevronRight } from 'react-native-feather';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const AnswerTranscriptScreen = ({ route, navigation }) => {
  const { test } = route.params;
  const [availableParts, setAvailableParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    fetchTestPartData(test.id);
  }, [test.id]);

  const fetchTestPartData = async (testId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${testId}`);
      if (response.status === 200) {
        const testData = response.data;
        const filteredParts = [1, 2, 3, 4, 5, 6, 7].filter((partNumber) =>
          testData.groupQuestions.some(
            (group) => group.part?.key === `part${partNumber}`
          )
        );
        setAvailableParts(filteredParts);
        setAllQuestions(testData.groupQuestions.map((group) => ({
          question: group.questionText,
          answer: group.correctAnswer,
        })));
      }
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading test content...</Text>
      </View>
    );
  }

  const PartCard = ({ part, onPress }) => (
    <TouchableOpacity
      style={styles.partCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.partIconContainer}>
        <Text style={styles.partIconText}>{part}</Text>
      </View>
      <View style={styles.partInfo}>
        <Text style={styles.partTitle}>Part {part}</Text>
        <Text style={styles.partDescription}>{getPartDescription(part)}</Text>
      </View>
      <ChevronRight width={20} height={20} stroke="#6366F1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>TOEIC TEST</Text>
            </View>
            <CheckCircle width={24} height={24} stroke="#10B981" fill="#10B981" />
          </View>
          <Text style={styles.testName}>{test?.name || 'Test Name'}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Test Sections</Text>
          
          {availableParts.length > 0 ? (
            <View style={styles.partsContainer}>
              {availableParts.map((part) => (
                <PartCard
                  key={part}
                  part={part}
                  onPress={() => navigation.navigate(`TestPart${part}Answer`, { testId: test.id })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No test parts available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getPartDescription = (part) => ({
  1: 'Photographs',
  2: 'Question-Response',
  3: 'Conversations',
  4: 'Short Talks',
  5: 'Incomplete Sentences',
  6: 'Text Completion',
  7: 'Reading Comprehension'
}[part] || '');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  testName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  partsContainer: {
    gap: 16,
  },
  partCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  partIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  partIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  partInfo: {
    flex: 1,
  },
  partTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  partDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AnswerTranscriptScreen;