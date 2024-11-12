import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Badge } from 'react-native-elements';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ResultTestPageScreen = () => {
  const [activeTab, setActiveTab] = useState('part-1');
  const navigation = useNavigation();

  const testInfo = {
    title: "New Economy TOEIC Test 10",
    score: "0/200",
    accuracy: "0.0%",
    time: "0:00:06",
    stats: {
      correct: 0,
      incorrect: 1,
      skipped: 199
    }
  };

  const partDetails = {
    'part-1': { range: [1, 6], title: 'Photographs' },
    'part-2': { range: [7, 31], title: 'Question-Response' },
    'part-3': { range: [32, 70], title: 'Conversations' },
    'part-4': {
      range: [71, 100],
      title: 'Short Talks',
      questions: [
        {
          type: "Chart Questions",
          questions: [93, 96, 98],
          correct: 0,
          incorrect: 0,
          skipped: 3,
          accuracy: "0.00%"
        },
        {
          type: "Detail Questions",
          questions: [71, 72, 75, 78, 81, 82, 85, 86, 89, 90],
          correct: 0,
          incorrect: 0,
          skipped: 15,
          accuracy: "0.00%"
        }
      ]
    },
    'part-5': { range: [101, 130], title: 'Incomplete Sentences' },
    'part-6': { range: [131, 146], title: 'Text Completion' },
    'part-7': { range: [147, 200], title: 'Reading Comprehension' },
  };

  const generateQuestionsForPart = (part) => {
    if (!partDetails[part]) return [];
    
    const details = partDetails[part];
    
    if (details.questions && details.questions.length > 0) {
      return details.questions;
    }
    
    const [start, end] = details.range;
    return [{
      type: details.title,
      questions: Array.from({ length: end - start + 1 }, (_, i) => start + i),
      correct: 0,
      incorrect: 0,
      skipped: end - start + 1,
      accuracy: "0.00%"
    }];
  };

  const ScoreCard = ({ label, value, icon, color }) => (
    <Card style={styles.scoreCard}>
      <Card.Content style={styles.scoreCardContent}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={styles.scoreCardLabel}>{label}</Text>
        <Text style={[styles.scoreCardValue, { color }]}>{value}</Text>
      </Card.Content>
    </Card>
  );

  const QuestionBadge = ({ number, status = 'skipped' }) => {
    const badgeStyle = {
      skipped: { bg: '#E0E0E0', text: '#757575' },
      correct: { bg: '#4CAF50', text: '#FFF' },
      incorrect: { bg: '#F44336', text: '#FFF' }
    }[status];

    return (
      <View style={[styles.questionBadge, { backgroundColor: badgeStyle.bg }]}>
        <Text style={[styles.questionBadgeText, { color: badgeStyle.text }]}>
          {number}
        </Text>
      </View>
    );
  };

  const PartSection = ({ section }) => (
    <Card style={styles.sectionCard} elevation={2}>
      <Card.Content>
        <Text style={styles.sectionTitle}>{section.type}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{section.correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
            <Text style={styles.statValue}>{section.incorrect}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="skip-next-circle" size={20} color="#9E9E9E" />
            <Text style={styles.statValue}>{section.skipped}</Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>
        </View>

        <Text style={styles.accuracyText}>
          Accuracy: {section.accuracy}
        </Text>
        
        <View style={styles.questionsGrid}>
          {section.questions.map(q => (
            <QuestionBadge key={q} number={q} />
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{testInfo.title}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => {/* Show answers */}}
            >
              <MaterialCommunityIcons name="file-document" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>View Answers</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("TestSubject")}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#2196F3" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scoreCardsContainer}>
          <ScoreCard 
            label="Total Score"
            value={testInfo.score}
            icon="trophy"
            color="#FFD700"
          />
          <ScoreCard 
            label="Accuracy"
            value={testInfo.accuracy}
            icon="percent"
            color="#2196F3"
          />
          <ScoreCard 
            label="Time Taken"
            value={testInfo.time}
            icon="clock-outline"
            color="#4CAF50"
          />
        </ScrollView>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          {Object.entries(partDetails).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.activeTab]}
              onPress={() => setActiveTab(key)}
            >
              <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
                {value.title}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.content}>
          {activeTab === 'overview' ? (
            Object.keys(partDetails).map(partKey => (
              generateQuestionsForPart(partKey).map((section, index) => (
                <PartSection key={`${partKey}-${index}`} section={section} />
              ))
            ))
          ) : (
            generateQuestionsForPart(activeTab).map((section, index) => (
              <PartSection key={index} section={section} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: 8,
  },
  scoreCardsContainer: {
    padding: 16,
  },
  scoreCard: {
    width: width * 0.35,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scoreCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  scoreCardLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  scoreCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    color: '#757575',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 16,
  },
  questionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ResultTestPageScreen;