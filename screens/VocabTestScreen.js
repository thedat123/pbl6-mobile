import React, { useEffect, useRef, useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Text, Animated, Dimensions, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Modal } from 'react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const QUESTION_TYPES = [
  'multiple-choice-translate',   
  'multiple-choice-definition',   
  'multiple-choice-example',     
  'multiple-choice-pronunciation', 
  'multiple-choice-image',  
  'writing-translate',   
  'writing-definition',   
  'writing-example',     
  'writing-pronunciation', 
  'writing-image',     
];

const VocabTestScreen = ({ route }) => {
  const { topicId } = route.params;
  const [results, setResults] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [progress, setProgress] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentIdQuestion, setCurrentIdQuestion] = useState(0);
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

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(true);

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

   const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
        showCancel: false,
  });

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
                {modal.type === 'danger' ? 'Logout' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  ));

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
        soundRef.current = sound;

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

  useEffect(() => {
    if (questions.length > 0 && !startTime) {
      setStartTime(Date.now());
    }
  }, [questions]);

  const generateQuestions = (data) => {
    const allQuestions = data.map((wordData) => {
        const allWords = data.map((item) => item.word);
        const incorrectAnswers = allWords
            .filter((option) => option !== wordData.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        while (incorrectAnswers.length < 3) {
            incorrectAnswers.push("Alternative Word");
        }

        const questionTypes = QUESTION_TYPES.slice(); // Copy to avoid modifying the original array
        let multipleChoiceQuestion = null;
        let writingQuestion = null;

        // Generate at least one multiple-choice question
        const generateMultipleChoice = (type) => {
            switch (type) {
                case 'multiple-choice-translate':
                    if (wordData.translate) {
                        return {
                            id: wordData.id,
                            text: "Choose the correct translation for this word",
                            word: `${wordData.word} (${wordData.wordClass})`,
                            options: [wordData.translate, ...incorrectAnswers.map(w => data.find(d => d.word === w)?.translate || "Alternative Translation")].sort(() => Math.random() - 0.5),
                            correctAnswer: wordData.translate,
                            current: wordData.word,
                            type: "multiple-choice",
                            questionType: 'multiple-choice-translate',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'multiple-choice-definition':
                    if (wordData.definition) {
                        return {
                            id: wordData.id,
                            text: "Choose the word that matches this definition",
                            word: wordData.definition,
                            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "multiple-choice",
                            questionType: 'multiple-choice-definition',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'multiple-choice-example':
                    if (wordData.example) {
                        return {
                            id: wordData.id,
                            text: "Choose the word used in this example",
                            word: wordData.example,
                            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "multiple-choice",
                            questionType: 'multiple-choice-example',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'multiple-choice-pronunciation':
                    if (wordData.pronunciation) {
                        return {
                            id: wordData.id,
                            text: "Choose the word with this pronunciation",
                            word: wordData.pronunciation,
                            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "multiple-choice",
                            questionType: 'multiple-choice-pronunciation',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'multiple-choice-image':
                    if (wordData.thumbnail) {
                        return {
                            id: wordData.id,
                            text: "Choose the word that matches this image",
                            word: wordData.thumbnail,
                            options: [wordData.word, ...incorrectAnswers].sort(() => Math.random() - 0.5),
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "multiple-choice",
                            questionType: 'multiple-choice-image',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                default:
                    return null;
            }
        };

        const generateWriting = (type) => {
            switch (type) {
                case 'writing-translate':
                    if (wordData.translate) {
                        return {
                            id: wordData.id,
                            text: "Write the word matched this translation",
                            word: wordData.translate,
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "writing",
                            questionType: 'writing-translate',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'writing-definition':
                    if (wordData.definition) {
                        return {
                            id: wordData.id,
                            text: "Write the word that matches this definition",
                            word: wordData.definition,
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "writing",
                            questionType: 'writing-definition',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'writing-example':
                    if (wordData.example) {
                        return {
                            id: wordData.id,
                            text: "Write the word that matches this example",
                            word: wordData.example,
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "writing",
                            questionType: 'writing-example',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'writing-pronunciation':
                    if (wordData.pronunciation) {
                        return {
                            id: wordData.id,
                            text: "Write the word that matches this pronunciation",
                            word: wordData.pronunciation,
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "writing",
                            questionType: 'writing-pronunciation',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                case 'writing-image':
                    if (wordData.image) {
                        return {
                            id: wordData.id,
                            text: "Write the word that matches this image",
                            word: wordData.image,
                            correctAnswer: wordData.word,
                            current: wordData.word,
                            type: "writing",
                            questionType: 'writing-image',
                            audioUri: wordData.audio,
                        };
                    }
                    return null;

                default:
                    return null;
            }
        };

        questionTypes.forEach((type) => {
            if (!multipleChoiceQuestion) {
                multipleChoiceQuestion = generateMultipleChoice(type);
            }
            if (!writingQuestion) {
                writingQuestion = generateWriting(type);
            }
        });

        if (!multipleChoiceQuestion) {
            multipleChoiceQuestion = generateMultipleChoice(QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)]);
        }
        if (!writingQuestion) {
            writingQuestion = generateWriting(QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)]);
        }

        return [multipleChoiceQuestion, writingQuestion];
    }).flat();

    // Remove null questions before returning
    const validQuestions = allQuestions.filter(q => q !== null);

    // Shuffle the questions
    const shuffledQuestions = validQuestions.sort(() => Math.random() - 0.5);
    return shuffledQuestions;
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
    if (currentQuestionIndex < questions.length) {
      setCurrentIdQuestion(questions[currentQuestionIndex].id);
    }
  }, [currentQuestionIndex, questions]);  

  useEffect(() => {
    const fetchQuestions = async () => {
          try {
              const response = await axios.get(`${API_BASE_URL}:3001/api/v1/topic/${topicId}`);
              const data = response.data.listWord;

              if (data && data.length > 0) {
                  const generatedQuestions = generateQuestions(data);

                  setQuestions(generatedQuestions);
                  setTotalQuestions(generatedQuestions.length);
                  setTopicName(response.data.name);

                  const alignedSelectedWord = generatedQuestions.map((question) =>
                      data.find((d) => d.word === question.current)
                  );

                  setSelectedWord(alignedSelectedWord);
              } else {
                  const token = await AsyncStorage.getItem('token');
                  console.log(topicId);
                  const fallbackResponse = await axios.get(
                      `${API_BASE_URL}:3001/api/v1/user-topic/${topicId}`,
                      {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        }
                      }
                  );

                  const fallbackData = fallbackResponse.data[0].words; // Extract words array
                  const topicName = fallbackResponse.data[0].name; // Extract topic name
                  setTopicName(topicName); // Set topic name in state

                  // Process words and generate questions if words exist
                  if (fallbackData && fallbackData.length > 0) {
                    // Generate questions based on words
                    const generatedQuestions = generateQuestions(fallbackData);

                    setQuestions(generatedQuestions); // Set questions in state
                    setTotalQuestions(generatedQuestions.length); // Set total number of questions

                    // Align selected words with the generated questions
                    const alignedSelectedWord = generatedQuestions.map((question) =>
                      fallbackData.find((word) => word.word === question.current)
                    );

                    setSelectedWord(alignedSelectedWord); // Set aligned words in state
                  } else {
                    throw new Error("No words found in fallback API.");
                  }
              }

              setLoading(false);
          } catch (error) {
              console.error("Failed to fetch data:", error);
              Alert.alert(
                  "Error",
                  "Unable to load test questions. Please try again later."
              );
              setLoading(false);
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
    setTimeout(() => {
        setAnswered(true);

        setTimeout(() => {
            moveToNextQuestion(isCorrect); // Truyền kết quả đúng/sai
        }, 2000);
    }, 2000);

    const newResult = { currentIdQuestion: currentIdQuestion, questionIndex: currentQuestionIndex, isCorrect };
    setResults((prevResults) => [...prevResults, newResult]); // Thêm kết quả vào trạng thái

    const imagePath = isCorrect ? imagePaths[currentImageIndex] : failImagePaths[currentImageIndex];
    setImageSource(imagePath);

    try {
        const soundFile = isCorrect
            ? require('../assets/audio/right_answer.mp3')
            : require('../assets/audio/wrong_answer.mp3');
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

  const moveToNextQuestion = (lastAnswer = null) => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }

    if (lastAnswer !== null) {
        const newResult = { currentIdQuestion: currentIdQuestion, questionIndex: currentQuestionIndex, isCorrect: lastAnswer };
        const updatedResults = [...results, newResult]; // Đồng bộ kết quả cuối cùng
        setResults(updatedResults); // Cập nhật kết quả vào trạng thái
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
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - startTime) / 1000); // in seconds
        setElapsedTime(totalTime);

        setTimeout(() => {
            const finalResults = lastAnswer !== null ? [...results, { currentIdQuestion, questionIndex: currentQuestionIndex, isCorrect: lastAnswer }] : results;
            navigation.navigate("VocabResultScreen", {
                topicId,
                results: finalResults,
                totalQuestions,
                topicName,
                totalTime,
            });
        }, 500);
    }
  };

  useEffect(() => {
    setResults([]); 
    setCurrentQuestionIndex(0); 
    setProgress(0); 
    setShowCorrectAnswer(false); 
    setSelectedAnswer(null); 
    isAnswerSubmitted.current = false; 
  }, [topicId]);

  const showAlert = (title, message, type, showCancel = false, onConfirm = () => {}) => {
    setModal({ visible: true, title, message, type, showCancel, onConfirm });
  };

  const handleClose = () => {
    showAlert(
      "Confirm Exit", 
      "Are you sure you want to end the test?", 
      "warning", 
      true, 
      () => {
        setIsTestRunning(false);
        navigation.navigate("VocabWaitScreen", { topicId: topicId });
      }
    );
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
              <AlertModal modal={modal} setModal={setModal} />
              
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
                {isTestRunning && (
                  <TimeCounter
                    key={currentQuestionIndex}
                    initialTime={20}
                    onTimeOut={handleTimeOut}
                    isTestComplete={currentQuestionIndex === questions.length - 1}
                  />
                )}
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
  // Base Layout
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFD', // Slightly lighter, easier on the eyes
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Header Section
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Close Button
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
  
  // Progress Tracking
  progressWrapper: {
    flex: 1,
    marginHorizontal: 16,
  },
  questionCounter: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2C4B', // Darker for better readability
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#EDF1F7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  
  // Timer Styles
  timerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  timer: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.5,
  },
  
  contentContainer: {
    marginTop: 8,
  },
  questionImageAndTextContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  questionMediaContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  questionImage: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: 16,
    backgroundColor: '#F8FAFD', // Placeholder background
  },
  questionTextContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  
  // Answer Sections
  answerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  multipleChoice: {
    flex: 1,
  },
  writingSection: {
    flex: 1,
  },
  
  // Word Content Container
  wordContentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF1F7',
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
});

export default VocabTestScreen;