import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { API_BASE_URL } from '@env';
import AudioPlayer from '../components/AudioPlayer';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ListenTestPractice = ({ route }) => {
  const { testId } = route.params;
  const [currentSentence, setCurrentSentence] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const totalSentences = lessonData?.listenLessons?.[0]?.listenSentences?.length || 0;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}:3001/api/v1/listen-group/${testId}`);
        const data = await response.json();
        setLessonData(data);
      } catch (error) {
        console.error('Failed to fetch lesson data:', error);
      }
    };
    fetchLessonData();
  }, [testId]);

  const handleNext = () => {
    if (currentSentence < totalSentences) {
      setCurrentSentence(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
      setIsCorrectAnswer(null);
    } else {
      navigation.navigate('ListenTestResult', { onRepeat: handleRetry });
    }
  };

  const handlePrev = () => {
    if (currentSentence > 1) {
      setCurrentSentence(prev => prev - 1);
      setUserAnswer('');
      setShowAnswer(false);
      setIsCorrectAnswer(null); // Reset the answer state
    }
  };

  const handleCheck = () => {
    const currentSentenceData = lessonData.listenLessons?.[0]?.listenSentences?.[currentSentence - 1] || {};
    if (userAnswer.trim().toLowerCase() === currentSentenceData.sentence?.trim().toLowerCase()) {
      setIsCorrectAnswer(true);
    } else {
      setIsCorrectAnswer(false);
    }
  };

  const handleRetry = () => {
    setCurrentSentence(1);
    setUserAnswer('');
    setShowAnswer(false);
    setIsCorrectAnswer(null);
    navigation.navigate('ListenTestPractice', { testId });
  };

  if (!lessonData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  const currentSentenceData = lessonData.listenLessons?.[0]?.listenSentences?.[currentSentence - 1] || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header and progress bar omitted for brevity */}
        <View style={styles.contentCard}>
          <View style={styles.audioSection}>
            <Text style={styles.sectionTitle}>Listen carefully</Text>
            <View style={styles.audioPlayer}>
              <AudioPlayer audioUri={currentSentenceData.audio} questionId={currentSentenceData.id} />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Your answer</Text>
            <TextInput
              style={[ 
                styles.input, 
                isCorrectAnswer === true && styles.correctInput, 
                isCorrectAnswer === false && styles.incorrectInput
              ]}
              placeholder="Type what you hear..."
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.checkButton} onPress={handleCheck}>
                <MaterialIcons name="check-circle" size={24} color="white" />
                <Text style={styles.buttonText}>Check Answer</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.showAnswerButton, showAnswer && styles.showAnswerButtonActive]} 
                onPress={() => setShowAnswer(!showAnswer)}
              >
                <MaterialIcons name={showAnswer ? "visibility-off" : "visibility"} size={24} color={showAnswer ? "#4F46E5" : "#6366F1"} />
                <Text style={[styles.buttonText, styles.showAnswerButtonText]}>
                  {showAnswer ? "Hide Answer" : "Show Answer"}
                </Text>
              </TouchableOpacity>
            </View>

            {showAnswer && (
              <View style={styles.answerCard}>
                <Text style={styles.answerLabel}>Correct Answer</Text>
                <Text style={styles.answerText}>{currentSentenceData.sentence}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.navigationBar}>
          <TouchableOpacity 
            style={[styles.navButton, styles.prevButton, currentSentence === 1 && styles.disabledButton]} 
            onPress={handlePrev}
            disabled={currentSentence === 1}
          >
            <MaterialIcons name="arrow-back" size={24} color={currentSentence === 1 ? "#94A3B8" : "#6366F1"} />
            <Text style={[styles.navButtonText, currentSentence === 1 && styles.disabledButtonText]}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentSentence === totalSentences ? 'Complete' : 'Next'}
            </Text>
            <MaterialIcons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  audioSection: {
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16,
  },
  correctInput: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  incorrectInput: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  checkButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  showAnswerButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  showAnswerButtonActive: {
    backgroundColor: '#E0E7FF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  showAnswerButtonText: {
    color: '#6366F1',
  },
  answerCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  answerLabel: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '700',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 18,
    color: '#065F46',
    lineHeight: 28,
  },
  navigationBar: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  prevButton: {
    backgroundColor: '#EEF2FF',
  },
  nextButton: {
    backgroundColor: '#6366F1',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
});

export default ListenTestPractice;