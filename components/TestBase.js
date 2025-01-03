import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Modal,
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
import { API_BASE_URL } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AlertModal = React.memo(({ modal, setModal }) => (
  <Modal
    transparent
    visible={modal.visible}
    animationType="fade"
    onRequestClose={() => setModal(prev => ({ ...prev, visible: false }))}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={[styles.modalHeader, styles[`${modal.type}Header`]]}>
          <Text style={styles.modalTitle}>{modal.title}</Text>
        </View>
        <View style={styles.modalBody}>
          <Text style={styles.modalMessage}>{modal.message}</Text>
        </View>
        <View style={styles.modalFooter}>
          {modal.showCancel && (
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setModal(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalConfirmButton]}
            onPress={() => {
              setModal(prev => ({ ...prev, visible: false }));
              modal.onConfirm();
            }}
          >
            <Text style={styles.modalButtonText}>
              {modal.type === 'danger' ? 'Try Again' : 'OK'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
));

const TestBase = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedParts = [], timeLimit, testId } = route.params || {};
  const [currentPart, setCurrentPart] = useState(selectedParts[0]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const initialTimeLeft = timeLimit ? timeLimit * 60 : 0;
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const [questionStatus, setQuestionStatus] = useState({});
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const scrollViewRef = useRef(null);
  const testPartRef = useRef({});
  const [questionPositions, setQuestionPositions] = useState({});
  const questionRefs = useRef({});
  const [modal, setModal] = useState({
      visible: false,
      title: '',
      message: '',
      type: 'info',
      onConfirm: () => {},
      showCancel: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (timeLimit ? (prev > 0 ? prev - 1 : 0) : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLimit]);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []); 

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const measureQuestionPosition = useCallback((questionId, event) => {
    const layout = event.nativeEvent.layout;
    setQuestionPositions(prev => ({
      ...prev,
      [questionId]: layout.y
    }));
  }, []);

  const handlePartQuestionStatus = (partQuestionStatus) => {
    setQuestionStatus(prev => ({
      ...prev,
      ...partQuestionStatus
    }));
  };

  const handleQuestionPress = (questionId) => {
    setCurrentQuestion(questionId);
    setQuestionStatus((prev) => ({ ...prev, [questionId]: 'viewed' }));
    scrollToQuestion(questionId);
  };
  
  const scrollToQuestion = (questionId) => {
    if (questionPositions[questionId] !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: questionPositions[questionId],
        animated: true
      });
    }
  }; 

  const showAlert = (title, message, type, showCancel = false, onConfirm = () => {}) => {
    setModal({ visible: true, title, message, type, showCancel, onConfirm });
  };

  const handleSubmit = () => {
    showAlert(
      "Submit Test",
      "Are you sure you want to submit your test?",
      'info',
      true,
      async () => {
        try {
          const allTestResults = selectedParts.map((part) => {
            const partRef = testPartRef.current[part];
            return {
              partName: part,
              answers: partRef?.getAnswers() || {},
              questionStatus: partRef?.getQuestionStatus() || {},
              duration: partRef?.getTestDuration() || 0,
              questionData: partRef?.getQuestionData() || [],
            };
          });
  
          const mergedResults = {
            answers: allTestResults.reduce((acc, part) => ({ ...acc, ...part.answers }), {}),
            questionStatus: allTestResults.reduce((acc, part) => ({ ...acc, ...part.questionStatus }), {}),
            duration: allTestResults.reduce((total, part) => total + part.duration, 0),
            questionData: allTestResults.flatMap((part) => part.questionData),
          };
  
          const userAnswers = Object.keys(mergedResults.answers).map((questionId) => ({
            idQuestion: questionId,
            answer: mergedResults.answers[questionId],
          }));
  
          const numCorrect = mergedResults.questionData.reduce((count, question) => {
            const userAnswer = mergedResults.answers[question.id];
            return userAnswer === question.correctAnswer ? count + 1 : count;
          }, 0);
  
          const userId = await AsyncStorage.getItem("userId");
          if (!userId) {
            throw new Error("Authentication userId not found. Please log in again.");
          }
  
          const dataToSend = {
            userId,
            testId,
            time: mergedResults.duration,
            userAnswer: userAnswers,
            isFullTest: selectedParts.length === 7,
          };

          console.log(dataToSend);
  
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found. Please log in again.");
          }
  
          const response = await axios.post(`${API_BASE_URL}:3001/api/v1/test-practice`, dataToSend, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          console.log(response);
          if (response.status === 201) {
            const testPracticeId = response.data.id;
  
            const testPracticeResponse = await axios.get(`${API_BASE_URL}:3001/api/v1/test-practice/${testPracticeId}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
  
            if (testPracticeResponse.status === 200 && testPracticeResponse.data) {
              const testPractice = testPracticeResponse.data.testPractice;
              navigation.navigate("TestDetailResult", {
                result: {
                  ...mergedResults,
                  numCorrect: testPractice.numCorrect,
                  totalQuestion: testPractice.totalQuestion,
                  LCScore: testPractice.LCScore,
                  RCScore: testPractice.RCScore,
                  testPracticeId: testPractice.id,
                  user: testPractice.user,
                  test: {
                    ...testPractice.test,
                    selectedParts,
                  },
                  userAnswers: testPractice.userAnswers,
                  time: mergedResults.duration,
                },
              });                  
            } else {
              throw new Error("Failed to fetch detailed test practice data.");
            }
          } else {
            throw new Error("Failed to submit test practice or invalid response format.");
          }
        } catch (error) {
          console.error("Error:", error);
          showAlert("Error", error.message || "An unknown error occurred.", "danger");
        }
      }
    );
  };  
  
  const renderPartNav = () => {
    if (selectedParts.length < 1) return null;
  
    return (
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={styles.navToggle}
          onPress={() => setIsNavExpanded(!isNavExpanded)}
        >
          <Text style={styles.navToggleText}>
            {currentPart}
          </Text>
          <Ionicons
            name={isNavExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#2196F3"
          />
        </TouchableOpacity>
  
        {isNavExpanded && (
          <View style={styles.partNavExpanded}>
            {selectedParts.map((partName) => (
              <TouchableOpacity
                key={partName}
                style={[styles.partTab, currentPart === partName && styles.partTabActive]}
                onPress={() => {
                  setCurrentPart(partName);  
                  setIsNavExpanded(false); 
                }}
              >
                <Text style={[styles.partTabText, currentPart === partName && styles.partTabTextActive]}>
                  {partName}
                </Text>
                {currentPart === partName && (
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
    const allQuestions = selectedParts.flatMap(part => {
      const partData = testPartRef.current[part]?.getQuestionData() || [];
  
      return partData.flatMap(p => p.questions ? p.questions : []);
    }).filter(Boolean);
  
    return allQuestions;
  };
  

  const renderCurrentPart = () => {
    const partComponentMap = {
      'Part 1': TestPart1,
      'Part 2': TestPart2,
      'Part 3': TestPart3,
      'Part 4': TestPart4,
      'Part 5': TestPart5,
      'Part 6': TestPart6,
      'Part 7': TestPart7,
    };
  
    const PartComponent = partComponentMap[currentPart] || TestPart1;
  
    return (
      <PartComponent
        ref={(ref) => (testPartRef.current[currentPart] = ref)}
        onQuestionStatusChange={handlePartQuestionStatus}
        testId={testId}
        onQuestionLayout={measureQuestionPosition}
        questionRefs={questionRefs}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Test Practice
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

      <ScrollView ref={scrollViewRef} style={styles.questionContainer} contentContainerStyle={styles.questionContentContainer}>
        {renderCurrentPart()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Nộp bài</Text>
        </TouchableOpacity>
        <AlertModal modal={modal} setModal={setModal} />
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalHeaderError: {
    backgroundColor: '#EA4335',
  },
  modalHeaderSuccess: {
    backgroundColor: '#34A853',
  },
  modalHeaderDanger: {
    backgroundColor: '#EA4335',
  },
  modalHeaderWarning: {
    backgroundColor: '#FBBC04',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
    backgroundColor: '#fff',
  },
  modalMessage: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#34A853',
  },
  modalCancelButton: {
    backgroundColor: '#EA4335',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default TestBase;