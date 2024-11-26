import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ResultTestPageScreen = ({ route }) => {
  const { testResults, totalQuestions } = route.params;
  const [activeTab, setActiveTab] = useState('part1');
  const [correct, setCorrect] = useState(0);
  const navigation = useNavigation();

  const renderHeader = () => {
    // Get selected parts from the partDetails
    const selectedPartTags = Object.keys(results.partDetails).sort().map(part => (
      <View key={part} style={styles.partTag}>
        <Text style={styles.partTagText}>Part {part}</Text>
      </View>
    ));
  
    return (
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.testType}>Practice Test Results</Text>
          <Text style={styles.testName}>New Economy TOEIC Test 2</Text>
          <View style={styles.partTags}>
            {selectedPartTags}
          </View>
        </View>
  
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="eye-outline" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>View Answers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => { navigation.navigate('MainAppNavigator') }}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#1976D2" />
            <Text style={styles.secondaryButtonText}>Back to Test Page</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };  

  const calculateResults = () => {
    const { answers, questionData } = testResults;
    
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    let partDetails = {};
    let totalScore = 0;
  
    // Đảm bảo chỉ tính toán cho các part được chọn
    const selectedParts = questionData.map((_, index) => index + 1);
    
    // Khởi tạo cấu trúc theo dõi số câu từng part
    const partQuestionCounts = {
      1: { max: 6, current: 0, weight: 5 },
      2: { max: 25, current: 0, weight: 5 },
      3: { max: 39, current: 0, weight: 3.33 },
      4: { max: 30, current: 0, weight: 3.33 },
      5: { max: 30, current: 0, weight: 2.5 },
      6: { max: 16, current: 0, weight: 2.5 },
      7: { max: 54, current: 0, weight: 2.5 }
    };
  
    if (!questionData || !Array.isArray(questionData)) {
      return {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        total: 0,
        accuracy: 0,
        duration: 0,
        partDetails: {},
        totalScore: 0,
        maxPossibleScore: 0
      };
    }
  
    // Chỉ xử lý các part được chọn
    selectedParts.forEach((partNumber) => {
      const partData = questionData[partNumber - 1];
      if (!partData || !partData.questions) return;
  
      if (!partDetails[partNumber]) {
        partDetails[partNumber] = {
          name: `Part ${partNumber}`,
          correct: 0,
          incorrect: 0,
          skipped: 0,
          total: 0,
          score: 0,
          maxPossibleScore: 0,
          currentQuestions: 0,
          maxQuestions: partQuestionCounts[partNumber]?.max || 0
        };
      }
  
      // Process questions within each part
      partData.questions.forEach((question) => {
        if (!question) return; // Skip if question is undefined
        
        partDetails[partNumber].currentQuestions++;
        const userAnswer = answers[question.id];
        
        if (!userAnswer) {
          skipped++;
          partDetails[partNumber].skipped++;
        } else if (userAnswer === question.correctAnswer) {
          correct++;
          partDetails[partNumber].correct++;
          const scorePerQuestion = partQuestionCounts[partNumber]?.weight || 0;
          totalScore += scorePerQuestion;
          partDetails[partNumber].score += scorePerQuestion;
        } else {
          incorrect++;
          partDetails[partNumber].incorrect++;
        }
        partDetails[partNumber].total++;
      });
      
      partDetails[partNumber].maxPossibleScore = 
        partDetails[partNumber].currentQuestions * (partQuestionCounts[partNumber]?.weight || 0);
    });
  
    const total = Object.values(partDetails).reduce((sum, part) => sum + part.total, 0);
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
  
    // Round scores
    totalScore = Math.round(totalScore);
    const maxPossibleScore = Math.round(
      Object.values(partDetails).reduce((sum, part) => sum + part.maxPossibleScore, 0)
    );
  
    return {
      correct,
      incorrect,
      skipped,
      total,
      accuracy,
      duration: testResults.duration || 0,
      partDetails,
      totalScore,
      maxPossibleScore
    };
  };  

  const renderPartAnalysis = () => {
    const currentPart = activeTab.replace('part', '');
    
    if (currentPart === 'summary' || !results.partDetails) return null;
  
    const partDetail = results.partDetails[currentPart];
    
    // Add a check in case partDetail is undefined
    if (!partDetail) return null;
  
    return (
      <View style={styles.analysisContainer}>
        <View style={styles.analysisCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryTitle}>[Part {currentPart}] Category Name</Text>
            <View style={styles.categoryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Correct</Text>
                <Text style={styles.statItemValue}>{partDetail.correct || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Incorrect</Text>
                <Text style={styles.statItemValue}>{partDetail.incorrect || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Skipped</Text>
                <Text style={styles.statItemValue}>{partDetail.skipped || 0}</Text>
              </View>
            </View>
            <View style={styles.accuracyRow}>
              <Text style={styles.accuracyText}>Accuracy:</Text>
              <Text style={styles.accuracyValue}>
                {partDetail.total > 0 
                  ? ((partDetail.correct / partDetail.total) * 100).toFixed(1) 
                  : '0.0'}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const results = calculateResults();

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderScoreSummary = () => (
    <View style={styles.scoreCards}>
      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <View style={styles.scoreIconWrapper}>
            <Ionicons name="trophy-outline" size={24} color="#FFB300" />
          </View>
          <View style={styles.scoreContent}>
            <Text style={styles.scoreValue}>{results.totalScore}/{results.maxPossibleScore}</Text>
            <Text style={styles.scoreLabel}>Total Score</Text>
          </View>
        </View>
        <View style={styles.scoreCard}>
          <View style={styles.scoreIconWrapper}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          </View>
          <View style={styles.scoreContent}>
            <Text style={styles.scoreValue}>{results.correct}/{results.total}</Text>
            <Text style={styles.scoreLabel}>Correct Answers</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.accuracyCard}>
        <View style={styles.accuracyHeader}>
          <Ionicons name="analytics-outline" size={20} color="#1976D2" />
          <Text style={styles.accuracyTitle}>Accuracy</Text>
        </View>
        <View style={styles.accuracyContent}>
          <Text style={styles.accuracyValue}>{results.accuracy.toFixed(1)}%</Text>
          <Text style={styles.accuracyLabel}>
            ({results.correct}/{results.total} questions)
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatistics = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, styles.correctIcon]}>
          <Ionicons name="checkmark" size={24} color="#FFF" />
        </View>
        <Text style={styles.statValue}>{results.correct}</Text>
        <Text style={styles.statLabel}>Correct</Text>
      </View>
      
      <View style={styles.statCard}>
        <View style={[styles.statIcon, styles.incorrectIcon]}>
          <Ionicons name="close" size={24} color="#FFF" />
        </View>
        <Text style={styles.statValue}>{results.incorrect}</Text>
        <Text style={styles.statLabel}>Incorrect</Text>
      </View>
      
      <View style={styles.statCard}>
        <View style={[styles.statIcon, styles.skippedIcon]}>
          <Ionicons name="remove" size={24} color="#FFF" />
        </View>
        <Text style={styles.statValue}>{results.skipped}</Text>
        <Text style={styles.statLabel}>Skipped</Text>
      </View>
    </View>
  );

  const renderTabs = () => {
    const parts = Object.keys(results.partDetails).sort();
    
    return (
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {parts.map(part => (
            <TouchableOpacity 
              key={part}
              style={[styles.tab, activeTab === `part${part}` && styles.activeTab]}
              onPress={() => setActiveTab(`part${part}`)}
            >
              <Text style={[styles.tabText, activeTab === `part${part}` && styles.activeTabText]}>
                Part {part}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
              Summary
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderDetailedAnalysis = () => (
    <View style={styles.analysisContainer}>
      <View style={styles.analysisCard}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryTitle}>[Part 1] Pictures Describing People and Objects</Text>
          <View style={styles.categoryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statItemLabel}>Correct</Text>
              <Text style={styles.statItemValue}>0</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemLabel}>Incorrect</Text>
              <Text style={styles.statItemValue}>0</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemLabel}>Skipped</Text>
              <Text style={styles.statItemValue}>1</Text>
            </View>
          </View>
          <View style={styles.accuracyRow}>
            <Text style={styles.accuracyText}>Accuracy:</Text>
            <Text style={styles.accuracyValue}>0.00%</Text>
          </View>
        </View>
      </View>

      <View style={styles.questionList}>
        <TouchableOpacity style={styles.questionItem}>
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>1</Text>
          </View>
          <View style={styles.questionContent}>
            <Text style={styles.questionStatus}>A: Not Answered</Text>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        {/* Add more question items as needed */}
      </View>
    </View>
  );

  const renderPartDetails = () => (
    <View style={styles.partDetailsContainer}>
      {Object.entries(results.partDetails).map(([partNumber, detail]) => (
        <View key={partNumber} style={styles.partDetailCard}>
          <Text style={styles.partTitle}>Part {partNumber}</Text>
          <Text style={styles.partStats}>
            Questions: {detail.currentQuestions}/{detail.maxQuestions}
          </Text>
          <Text style={styles.partScore}>
            Score: {Math.round(detail.score)}/{Math.round(detail.maxPossibleScore)}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderScoreSummary()}
        {renderStatistics()}
        {renderTabs()}
        {activeTab === 'summary' ? renderDetailedAnalysis() : renderPartAnalysis()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  titleContainer: {
    marginBottom: 16,
  },
  testType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  partTags: {
    flexDirection: 'row',
    marginTop: 8,
  },
  partTag: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  partTagText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976D2',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scoreCards: {
    padding: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  scoreIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scoreContent: {
    flex: 1,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  accuracyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  accuracyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  accuracyContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  correctIcon: {
    backgroundColor: '#4CAF50',
  },
  incorrectIcon: {
    backgroundColor: '#F44336',
  },
  skippedIcon: {
    backgroundColor: '#9E9E9E',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1976D2',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  analysisContainer: {
    padding: 16,
  },
  analysisCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  accuracyText: {
    fontSize: 14,
    color: '#666',
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  questionList: {
    marginTop: 16,
  },
  questionItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  questionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionStatus: {
    fontSize: 14,
    color: '#666',
  },
  detailButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  detailButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  noQuestionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 24,
  },
  // Add styles for error state
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  partDetailsContainer: {
    padding: 16,
    marginTop: 16,
  },
  partDetailCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  partTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partStats: {
    fontSize: 14,
    color: '#666',
  },
  partScore: {
    fontSize: 14,
    color: '#1976D2',
    marginTop: 4,
  },
});

export default ResultTestPageScreen;