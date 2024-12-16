import React, { useEffect, useRef, useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import TimeCounter from '../components/TimeCounter';
import QuestionVocab from '../components/QuestionVocab';
import MultipleChoiceVocab from '../components/MultipleChoiceVocab';
import WritingVocab from '../components/WritingVocab';
import axios from "axios";
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import WordContent from '../components/WordContent';
import { API_BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const QUESTION_TYPES = [
  'multiple-choice-translate',   
  'multiple-choice-definition',   
  'multiple-choice-example',     
  'multiple-choice-pronunciation', 
  'multiple-choice-image',       
];

const VocabTestScreen = ({ route }) => {
  const { topicId } = route.params;
  const [results, setResults] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [progress, setProgress] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const isAnswerSubmitted = useRef(false);
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [totalQuestions, setTotalQuestions] = useState(0);
  const timerRef = useRef(null);
  const [imageSource, setImageSource] = useState(
    require('../assets/images/Vocab/voca-persons/1/image.png')
  );

  const tickSound = useRef({ sound: null });
  const [selectedWord, setSelectedWord] = useState([]);
  const [answered, setAnswered] = useState(false);
  const soundRef = useRef(null);

    const imagePaths = [
      require('../assets/images/Vocab/voca-persons/1/correct.gif'),
      require('../assets/images/Vocab/voca-persons/2/correct.gif'),
      require('../assets/images/Vocab/voca-persons/3/correct.gif'),
      require('../assets/images/Vocab/voca-persons/4/correct.gif'),
      require('../assets/images/Vocab/voca-persons/5/correct.gif'),
      require('../assets/images/Vocab/voca-persons/6/correct.gif'),
      require('../assets/images/Vocab/voca-persons/7/correct.gif'),
      require('../assets/images/Vocab/voca-persons/8/correct.gif')
    ];
  
    const failImagePaths = [
      require('../assets/images/Vocab/voca-persons/1/fail.gif'),
      require('../assets/images/Vocab/voca-persons/2/fail.gif'),
      require('../assets/images/Vocab/voca-persons/3/fail.gif'),
      require('../assets/images/Vocab/voca-persons/4/fail.gif'),
      require('../assets/images/Vocab/voca-persons/5/fail.gif'),
      require('../assets/images/Vocab/voca-persons/6/fail.gif'),
      require('../assets/images/Vocab/voca-persons/7/fail.gif'),
      require('../assets/images/Vocab/voca-persons/8/fail.gif')
    ];
  
    const defaultImagePaths = [
      require('../assets/images/Vocab/voca-persons/1/image.png'),
      require('../assets/images/Vocab/voca-persons/2/image.png'),
      require('../assets/images/Vocab/voca-persons/3/image.png'),
      require('../assets/images/Vocab/voca-persons/4/image.png'),
      require('../assets/images/Vocab/voca-persons/5/image.png'),
      require('../assets/images/Vocab/voca-persons/6/image.png'),
      require('../assets/images/Vocab/voca-persons/7/image.png'),
      require('../assets/images/Vocab/voca-persons/8/image.png')
    ];
  
    const totalImages = 8;

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

  const handleSpeak = async (audioUri) => {
    if (audioUri) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        soundRef.current = sound; // Store sound in the ref

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
          }
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleSpeakExample = async (exampleAudioUri) => {
    if (exampleAudioUri) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: exampleAudioUri },
          { shouldPlay: true }
        );
        soundRef.current = sound; // Store sound in the ref

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
          }
        });
      } catch (error) {
        console.error('Error playing example audio:', error);
      }
    }
  };

  const generateQuestions = (data) => {
    return data.map((wordData) => {
      const allWords = data.map((item) => item.word);
      const incorrectAnswers = allWords
        .filter((option) => option !== wordData.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      while (incorrectAnswers.length < 3) {
        incorrectAnswers.push("Alternative Word");
      }

      const questionType = QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)];

      switch (questionType) {
        case 'multiple-choice-translate':
          return {
            text: "Choose the correct translation for this word",
            word: `${wordData.word} (${wordData.wordClass})`,
            options: [wordData.translate, ...incorrectAnswers.map(w => data.find(d => d.word === w)?.translate || "Alternative Translation")].sort(() => Math.random() - 0.5),
            correctAnswer: wordData.translate,
            current: wordData.word,
            type: "multiple-choice",
            questionType: questionType,
            audioUri: wordData.audio,
          };

        case 'multiple-choice-definition':
          return {
            text: "Choose the word that matches this definition",
            word: wordData.definition,
            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
            correctAnswer: wordData.word,
            current: wordData.word,
            type: "multiple-choice",
            questionType: questionType,
            audioUri: wordData.audio,
          };

        case 'multiple-choice-example':
          return {
            text: "Choose the word used in this example",
            word: wordData.example,
            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
            correctAnswer: wordData.word,
            current: wordData.word,
            type: "multiple-choice",
            questionType: questionType,
            audioUri: wordData.audio,
          };

        case 'multiple-choice-pronunciation':
          return {
            text: "Choose the word with this pronunciation",
            word: wordData.pronunciation,
            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
            correctAnswer: wordData.word,
            current: wordData.word,
            type: "multiple-choice",
            questionType: questionType,
            audioUri: wordData.audio,
          };

        case 'multiple-choice-image':
          return {
            text: "Choose the word that matches this image",
            word: wordData.thumbnail,
            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
            correctAnswer: wordData.word,
            current: wordData.word,
            type: "multiple-choice",
            questionType: questionType,
            audioUri: wordData.audio,
          };

        default:
          return {
            text: "Choose the correct translation",
            word: `${wordData.word} (${wordData.wordClass})`,
            options: [wordData.translate, ...incorrectAnswers.map(w => data.find(d => d.word === w)?.translate || "Alternative Translation")].sort(() => Math.random() - 0.5),
            correctAnswer: wordData.translate,
            current: wordData.word,
            type: "multiple-choice",
            questionType: 'multiple-choice-translate',
            audioUri: wordData.audio,
          };
      }
    });
  };

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);   

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}:3001/api/v1/topic/${topicId}`);
        const data = response.data.listWord;

        const generatedQuestions = generateQuestions(data);

        setQuestions(generatedQuestions);
        setTotalQuestions(generatedQuestions.length);
        setTopicName(response.data.name);
        setSelectedWord(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        Alert.alert("Error", "Unable to load test questions. Please try again later.");
      }
    };

    fetchQuestions();
  }, [topicId]);

  const currentQuestion = questions[currentQuestionIndex];

  const renderQuestionContent = () => {
    if (currentQuestion.questionType === 'multiple-choice-image') {
      return (
        <View style={styles.questionImageContainer}>
          <Image 
            source={{ uri: currentQuestion.word }} 
            style={styles.questionImage} 
          />
        </View>
      );
    }

    return (
      <QuestionVocab 
        questionData={currentQuestion} 
        style={styles.question} 
      />
    );
  };

  const handleAnswer = async (isCorrect) => {
    if (isAnswerSubmitted.current) return;
    isAnswerSubmitted.current = true;
    
    setProgress((prev) => Math.min(prev + 1 / totalQuestions, 1));
    setShowCorrectAnswer(true);
    setAnswered(true);
  
    setResults((prevResults) => [
      ...prevResults,
      { questionIndex: currentQuestionIndex, isCorrect },
    ]);
  
    const imagePath = isCorrect ? imagePaths[currentImageIndex] : failImagePaths[currentImageIndex];
    setImageSource(imagePath);
  
    try {
      // Play sound for correct or incorrect answer
      const soundFile = isCorrect ? require('../assets/audio/right_answer.mp3') : require('../assets/audio/wrong_answer.mp3');
      const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
      tickSound.current = sound;
  
      await handleSpeak(currentQuestion.audioUri);
  
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
        }
      });
    } catch (error) {
      console.error("Error handling answer sound:", error);
    }
  };
     
      
  const handleTimeOut = () => {
    if (isAnswerSubmitted.current) return;
    isAnswerSubmitted.current = true;
    setShowCorrectAnswer(true);
  
    if (timerRef.current) {
      clearTimeout(timerRef.current);  
    }
  };

  const moveToNextQuestion = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;  
    }
  
    animateTransition();
  
    const randomImageIndex = Math.floor(Math.random() * totalImages);
    setCurrentImageIndex(randomImageIndex);
    setImageSource(defaultImagePaths[randomImageIndex]);
  
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowCorrectAnswer(false);
      setSelectedAnswer(null);
      isAnswerSubmitted.current = false;
      setAnswered(false);
    } else {
      setTimeout(() => {
        navigation.navigate("VocabResultScreen", {
          topicId,
          results,
          totalQuestions,
          topicName,
        });
      }, 500);
    }
  };  

  useEffect(() => {
    if (showCorrectAnswer) {
      const timer = setTimeout(() => moveToNextQuestion(), 1500);
      return () => clearTimeout(timer);
    }
  }, [showCorrectAnswer]);

  useEffect(() => {
    setResults([]); 
    setCurrentQuestionIndex(0); 
    setProgress(0); 
    setShowCorrectAnswer(false); 
    setSelectedAnswer(null); 
    isAnswerSubmitted.current = false; 
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#48BB78" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AntDesign name="close" size={20} color="#FFF" />
              </TouchableOpacity>
              
              <View style={styles.progressWrapper}>
                <Text style={styles.questionCounter}>
                  Question {currentQuestionIndex + 1}/{totalQuestions}
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
                  isTestComplete={currentQuestionIndex === questions.length - 1}
                  style={styles.timer}
                />
              </View>
            </View>
  
            {answered ? (
              <View style={styles.wordContentContainer}>
                <WordContent
                  word={selectedWord[currentQuestionIndex]}
                  currentView={2}
                  handleSpeak={handleSpeak}
                  handleSpeakExample={handleSpeakExample}
                />
              </View>
            ) : (
              <View style={styles.contentContainer}>
                <Animated.View
                  style={[
                    styles.questionImageAndTextContainer,
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
                  <View style={styles.questionImageAndTextContainer}>
                    <View style={styles.questionMediaContainer}>
                      <Image
                        source={imageSource}
                        style={styles.questionImage}
                        contentFit="contain"
                      />
                      <View style={styles.questionTextContainer}>
                        {renderQuestionContent()}
                      </View>
                    </View>
                   </View>
                </Animated.View>
  
                {/* Answer Section */}
                <Animated.View 
                  style={[
                    styles.answerSection, 
                    { opacity: fadeAnim }
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
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Softer, more calming background
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressWrapper: {
    flex: 1,
    marginHorizontal: 16,
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
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#48BB78',
    borderRadius: 4,
  },
  timerContainer: {
    backgroundColor: '#F7FAFC',
    padding: 10,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  contentContainer: {
    flex: 1,
  },
  questionImageAndTextContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionMediaContainer: {
    flexDirection: 'column', // Stack vertically
    alignItems: 'center', // Center items horizontally
    width: '100%', // Full width
  },
  questionImage: {
    width: '100%', // Make image full width of container
    aspectRatio: 1, // Maintain square aspect ratio
    maxWidth: 300, // Maximum width
    maxHeight: 300, // Maximum height
    borderRadius: 16,
    marginBottom: 15, // Space between image and text
  },
  questionTextContainer: {
    width: '100%', // Full width
    alignItems: 'center', // Center text
    paddingHorizontal: 10,
  },
  answerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  multipleChoice: {
    flex: 1,
  },
  writingSection: {
    flex: 1,
  },
  wordContentContainer: {
    backgroundColor: '#F0F4F8',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
});

export default VocabTestScreen;