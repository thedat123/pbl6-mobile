import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TestPart1 from '../screens/TestPart1';
import TestPart2 from '../screens/TestPart2';
import TestPart3 from '../screens/TestPart3';
import TestPart4 from '../screens/TestPart4';
import TestPart5 from '../screens/TestPart5';
import TestPart6 from '../screens/TestPart6';
import TestPart7 from '../screens/TestPart7';
import { QuestionNavigation } from './QuestionTest';

const { width } = Dimensions.get('window');

const TestBase = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedParts = [], timeLimit } = route.params || {};
  const [currentPart, setCurrentPart] = useState(selectedParts[0] || 1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const initialTimeLeft = timeLimit ? timeLimit * 60 : 0;
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [questionStatus, setQuestionStatus] = useState({});
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const scrollViewRef = useRef(null);
  const testPartRef = useRef({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (timeLimit ? (prev > 0 ? prev - 1 : 0) : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLimit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setQuestionStatus((prev) => ({ ...prev, [questionId]: 'answered' }));
  };

  const handleQuestionPress = (questionId) => {
    setCurrentQuestion(questionId);
    setQuestionStatus((prev) => ({ ...prev, [questionId]: 'viewed' }));
    scrollToTop();
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSubmit = () => {
    Alert.alert(
      "Nộp bài",
      "Bạn có chắc chắn muốn nộp bài?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Nộp bài",
          onPress: () => {
            const unansweredQuestions = Object.keys(questionStatus).filter(
              (id) => !answers[id]
            ).length;

            if (unansweredQuestions > 0) {
              Alert.alert(
                "Cảnh báo",
                `Bạn còn ${unansweredQuestions} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
                [
                  { text: "Kiểm tra lại", style: "cancel" },
                  {
                    text: "Nộp bài",
                    onPress: () => Alert.alert("Thành công", "Bài thi của bạn đã được nộp!"),
                  },
                ]
              );
            } else {
              navigation.navigate('ResultTestPageScreen');
            }
          },
        },
      ]
    );
  };

  const renderPartNav = () => {
    if (selectedParts.length <= 1) return null;
  
    return (
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={styles.navToggle}
          onPress={() => setIsNavExpanded(!isNavExpanded)}
        >
          <Text style={styles.navToggleText}>
            Part {currentPart}
          </Text>
          <Ionicons 
            name={isNavExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#2196F3" 
          />
        </TouchableOpacity>
  
        {isNavExpanded && (
          <View style={styles.partNavExpanded}>
            {selectedParts.map(partNumber => (
              <TouchableOpacity
                key={partNumber}
                style={[
                  styles.partTab,
                  currentPart === partNumber && styles.partTabActive
                ]}
                onPress={() => {
                  setCurrentPart(partNumber);
                  setIsNavExpanded(false);
                }}
              >
                <Text style={[
                  styles.partTabText,
                  currentPart === partNumber && styles.partTabTextActive
                ]}>
                  Part {partNumber}
                </Text>
                {currentPart === partNumber && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const getAllQuestions = () => {
    const allQuestions = selectedParts.flatMap(part =>
      testPartRef.current[part]?.getQuestionData()?.flatMap(p => p.questions) || []
    ).filter(question => question);
    return allQuestions;
  };

  const renderCurrentPart = () => {
    switch (currentPart) {
      case 1:
        return <TestPart1 ref={(ref) => (testPartRef.current[1] = ref)} />;
      case 2:
        return <TestPart2 ref={(ref) => (testPartRef.current[2] = ref)} />;
      case 3:
        return <TestPart3 ref={(ref) => (testPartRef.current[3] = ref)} />;
      case 4:
        return <TestPart4 ref={(ref) => (testPartRef.current[4] = ref)} />;
      case 5:
        return <TestPart5 ref={(ref) => (testPartRef.current[5] = ref)} />;
      case 6:
        return <TestPart6 ref={(ref) => (testPartRef.current[6] = ref)} />;
      case 7:
        return <TestPart7 ref={(ref) => (testPartRef.current[7] = ref)} />;
      default:
        return <TestPart1 />;
    }
  };  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {selectedParts.length > 1 ? 'TEST PRACTICE' : `PART ${currentPart}`}
          </Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color="#2196F3" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
        {renderPartNav()}
        <View style={styles.navigationWrapper}>
          <QuestionNavigation
            questions={getAllQuestions()}
            questionStatus={questionStatus}
            onQuestionPress={handleQuestionPress}
          />
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.questionContainer}
        contentContainerStyle={styles.questionContentContainer}
      >
        {renderCurrentPart()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>Nộp bài</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  navigationWrapper: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    marginLeft: 8,
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 16,
  },
  navContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
  },
  navToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  navToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
  partNavExpanded: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  partTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  partTabActive: {
    backgroundColor: '#2196F3',
  },
  partTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  partTabTextActive: {
    color: '#fff',
  },
  questionContainer: {
    flex: 1,
  },
  questionContentContainer: {
    padding: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
};

export default TestBase;