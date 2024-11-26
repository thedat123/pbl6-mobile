import React, { useEffect, useRef, useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import TimeCounter from '../components/TimeCounter';
import QuestionVocab from '../components/QuestionVocab';
import MultipleChoiceVocab from '../components/MultipleChoiceVocab';
import WritingVocab from '../components/WritingVocab';
import axios from "axios";
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const VocabTestScreen = ({ route }) => {
  const { topicId } = route.params;
  const [results, setResults] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [progress, setProgress] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const isAnswerSubmitted = useRef(false);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [totalQuestions, setTotalQuestions] = useState(0);

  const animateTransition = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:3000/api/v1/topic/${topicId}`);
        const data = response.data.__listWord__;

        // Generate questions
        const generatedQuestions = data.map((wordData, index) => {
          const allWords = data.map((item) => item.translate);
          const incorrectAnswers = allWords
            .filter((option) => option !== wordData.translate) // Loại bỏ đáp án đúng
            .sort(() => Math.random() - 0.5) // Xáo trộn ngẫu nhiên
            .slice(0, 3); // Lấy tối đa 3 đáp án sai

          // Kiểm tra để đảm bảo luôn có đủ 4 đáp án
          while (incorrectAnswers.length < 3) {
            incorrectAnswers.push("Đáp án khác");
          }

          // Trộn đáp án đúng vào danh sách và xáo trộn lại
          const options = [wordData.translate, ...incorrectAnswers].sort(() => Math.random() - 0.5);

          return {
            text: "Chọn nghĩa đúng với từ vựng sau",
            word: `${wordData.word} (${wordData.wordClass})`,
            options,
            correctAnswer: wordData.translate,
            type: "multiple-choice",
          };
        });

        setQuestions(generatedQuestions);
        setTotalQuestions(generatedQuestions.length);
        setTopicName(response.data.name);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        Alert.alert("Error", "Unable to load test questions. Please try again later.");
      }
    };

    fetchQuestions();
  }, [topicId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (isCorrect) => {
    if (isAnswerSubmitted.current) return;

    isAnswerSubmitted.current = true;
    setProgress((prev) => Math.min(prev + 1 / totalQuestions, 1));
    setShowCorrectAnswer(true);

    setResults((prevResults) => [
      ...prevResults,
      { questionIndex: currentQuestionIndex, isCorrect },
    ]);    

    if (!isCorrect) {
      // Shake animation for incorrect answer
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleTimeOut = () => {
    if (isAnswerSubmitted.current) return;
    isAnswerSubmitted.current = true;
    setShowCorrectAnswer(true);
  };

  const moveToNextQuestion = () => {
    animateTransition();
    setCurrentQuestionIndex((prevIndex) => {
      if (prevIndex < questions.length - 1) {
        return prevIndex + 1;
      } else {
        navigation.navigate("VocabResultScreen", {
          topicId: topicId,
          results: results,
          totalQuestions: totalQuestions,
          topicName: topicName,
        });
        return prevIndex;
      }
    });

    setShowCorrectAnswer(false);
    setSelectedAnswer(null);
    isAnswerSubmitted.current = false;
  };

  useEffect(() => {
    if (showCorrectAnswer) {
      const timer = setTimeout(() => moveToNextQuestion(), 1500);
      return () => clearTimeout(timer);
    }
  }, [showCorrectAnswer]);

  useEffect(() => {
    setResults([]); // Clear previous results
    setCurrentQuestionIndex(0); // Reset question index
    setProgress(0); // Reset progress
    setShowCorrectAnswer(false); // Reset correct answer visibility
    setSelectedAnswer(null); // Reset selected answer
    isAnswerSubmitted.current = false; // Reset submission flag
  }, [topicId]);

  const handleClose = () => {
    Alert.alert("Xác nhận thoát", "Bạn có chắc muốn kết thúc bài kiểm tra?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đồng ý", onPress: () => navigation.goBack() },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <AntDesign name="close" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.progressWrapper}>
              <Text style={styles.questionCounter}>
                Câu hỏi {currentQuestionIndex + 1}/{totalQuestions}
              </Text>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.timerContainer}>
              <TimeCounter
                key={currentQuestionIndex}
                initialTime={20}
                onTimeOut={handleTimeOut}
                style={styles.timer}
              />
            </View>
          </View>

          {/* Question Section */}
          <Animated.View
            style={[
              styles.questionSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateX: shakeAnimation },
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <QuestionVocab questionData={currentQuestion} style={styles.question} />
          </Animated.View>

          {/* Answer Section */}
          <Animated.View
            style={[
              styles.answerSection,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {currentQuestion.type === "multiple-choice" ? (
              <MultipleChoiceVocab
              key={currentQuestionIndex}
              questionData={currentQuestion}
              onAnswer={handleAnswer}
              showCorrectAnswer={showCorrectAnswer}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
              correctAnswer={currentQuestion.correctAnswer} 
              style={styles.multipleChoice}
            />            
            ) : (
              <WritingVocab
                key={currentQuestionIndex}
                correctAnswer={currentQuestion.correctAnswer}
                onAnswer={handleAnswer}
                showCorrectAnswer={showCorrectAnswer}
                setSelectedAnswer={setSelectedAnswer}
                style={styles.writingSection}
              />
            )}
          </Animated.View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5252',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  progressWrapper: {
    flex: 1,
    marginHorizontal: 20,
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#48BB78',
    borderRadius: 4,
  },
  timerContainer: {
    padding: 12,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  questionSection: {
    marginBottom: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  answerSection: {
    flex: 1,
  },
  multipleChoice: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  writingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default VocabTestScreen;