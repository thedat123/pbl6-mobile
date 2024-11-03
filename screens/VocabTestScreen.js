import React, { useEffect, useRef, useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import TimeCounter from '../components/TimeCounter';
import QuestionVocab from '../components/QuestionVocab';
import MultipleChoiceVocab from '../components/MultipleChoiceVocab';
import WritingVocab from '../components/WritingVocab';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const VocabTestScreen = () => {
  const navigation = useNavigation();
  const totalQuestions = 20;
  const [progress, setProgress] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const isAnswerSubmitted = useRef(false);
  
  // Animation refs
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Animation for smooth question transitions
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

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  const questions = [
    // 14 câu trắc nghiệm
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Wedding (n)',
      options: ['Lễ cưới, đám cưới', '(việc) thêu, thêu thùa', 'Cảnh, phân cảnh', 'Đáp án khác'],
      correctAnswer: 'Lễ cưới, đám cưới',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Art (n)',
      options: ['Nghệ thuật', 'Điều khiển', 'Tàu biển', 'Động vật'],
      correctAnswer: 'Nghệ thuật',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Dog (n)',
      options: ['Con mèo', 'Con chó', 'Con ngựa', 'Con chim'],
      correctAnswer: 'Con chó',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Sky (n)',
      options: ['Bầu trời', 'Ngôi nhà', 'Con sông', 'Ngọn núi'],
      correctAnswer: 'Bầu trời',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Mountain (n)',
      options: ['Ngọn núi', 'Bãi biển', 'Thị trấn', 'Thành phố'],
      correctAnswer: 'Ngọn núi',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Car (n)',
      options: ['Xe hơi', 'Xe đạp', 'Xe máy', 'Xe tải'],
      correctAnswer: 'Xe hơi',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'River (n)',
      options: ['Dòng sông', 'Bãi cát', 'Thác nước', 'Hồ nước'],
      correctAnswer: 'Dòng sông',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Tree (n)',
      options: ['Cây cối', 'Cánh đồng', 'Thảm cỏ', 'Bông hoa'],
      correctAnswer: 'Cây cối',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'House (n)',
      options: ['Ngôi nhà', 'Cây cầu', 'Đại dương', 'Đồng ruộng'],
      correctAnswer: 'Ngôi nhà',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Cat (n)',
      options: ['Con mèo', 'Con chó', 'Con thỏ', 'Con hươu'],
      correctAnswer: 'Con mèo',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Book (n)',
      options: ['Cuốn sách', 'Cái ghế', 'Cái bàn', 'Chiếc xe'],
      correctAnswer: 'Cuốn sách',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Sun (n)',
      options: ['Mặt trời', 'Mặt trăng', 'Ngôi sao', 'Đám mây'],
      correctAnswer: 'Mặt trời',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Bicycle (n)',
      options: ['Xe đạp', 'Xe máy', 'Xe tải', 'Xe buýt'],
      correctAnswer: 'Xe đạp',
      type: 'multiple-choice',
    },
    {
      text: 'Chọn nghĩa đúng với từ vựng sau',
      word: 'Phone (n)',
      options: ['Điện thoại', 'Máy tính', 'Tivi', 'Loa'],
      correctAnswer: 'Điện thoại',
      type: 'multiple-choice',
    },

    // 6 câu tự luận
    {
      text: 'Viết nghĩa đúng của từ sau',
      word: 'Apple (n)',
      correctAnswer: 'Apple',
      type: 'writing',
    },
    {
      text: 'Viết nghĩa đúng của từ sau',
      word: 'Computer (n)',
      correctAnswer: 'Computer',
      type: 'writing',
    },
    {
      text: 'Viết nghĩa đúng của từ sau',
      word: 'School (n)',
      correctAnswer: 'School',
      type: 'writing',
    },
    {
      text: 'Viết nghĩa đúng của từ sau',
      word: 'Teacher (n)',
      correctAnswer: 'Teacher',
      type: 'writing',
    },
    {
      text: 'Viết nghĩa đúng của từ sau',
      word: 'Student (n)',
      correctAnswer: 'Student',
      type: 'writing',
    },
    {
      text: 'Viết nghĩa đúng của từ sau',
      word: 'Library (n)',
      correctAnswer: 'Library',
      type: 'writing',
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (isCorrect) => {
    if (isAnswerSubmitted.current) return;

    isAnswerSubmitted.current = true;
    setProgress((prev) => Math.min(prev + 1 / totalQuestions, 1));
    setShowCorrectAnswer(true);

    // Chỉ thực hiện animation rung khi trả lời sai
    if (!isCorrect) {
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
        navigation.navigate('VocabResultScreen');
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

  const handleClose = () => {
    Alert.alert(
      "Xác nhận thoát",
      "Bạn có chắc muốn kết thúc bài kiểm tra?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
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
                  { width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })}
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
                { translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}
              ]
            }
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
              transform: [{ translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}]
            }
          ]}
        >
          {currentQuestion.type === 'multiple-choice' ? (
            <MultipleChoiceVocab
              key={currentQuestionIndex}
              questionData={currentQuestion}
              onAnswer={handleAnswer}
              showCorrectAnswer={showCorrectAnswer}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
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