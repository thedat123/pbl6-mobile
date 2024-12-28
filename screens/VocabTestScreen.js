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

        // Generate at least one writing question
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

        // Ensure we generate one question of each type
        questionTypes.forEach((type) => {
            if (!multipleChoiceQuestion) {
                multipleChoiceQuestion = generateMultipleChoice(type);
            }
            if (!writingQuestion) {
                writingQuestion = generateWriting(type);
            }
        });

        // If a question type doesn't exist, fallback to another type.
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
        moveToNextQuestion();
      }, 2000);
    }, 2000); 
  
    setResults((prevResults) => [
      ...prevResults,
      { currentIdQuestion: currentIdQuestion, questionIndex: currentQuestionIndex, isCorrect },
    ]);
  
    const imagePath = isCorrect ? imagePaths[currentImageIndex] : failImagePaths[currentImageIndex];
    setImageSource(imagePath);
  
    try {
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
      const endTime = Date.now();
      const totalTime = Math.floor((endTime - startTime) / 1000); // in seconds
      setElapsedTime(totalTime);
  
      setTimeout(() => {
        navigation.navigate("VocabResultScreen", {
          topicId,
          results,
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
    backgroundColor: '#F7F9FC', // Softer, more modern background
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Slightly larger radius for softer look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  closeButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },

  // Progress Tracking
  progressWrapper: {
    flex: 1,
    marginHorizontal: 20,
  },
  questionCounter: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C3E50', // Slightly darker for better contrast
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 10, // Slightly thicker
    backgroundColor: '#E8EDF3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50', // More vibrant green
    borderRadius: 5,
  },

  // Timer Styles
  timerContainer: {
    backgroundColor: '#FFFFFF', // White background for depth
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timer: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#34495E', // Rich, deep color
  },

  // Content Containers
  contentContainer: {
    flex: 1,
  },
  questionImageAndTextContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Larger radius for softer edges
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  questionMediaContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  questionImage: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 350,
    maxHeight: 350,
    borderRadius: 20,
    marginBottom: 20,
    resizeMode: 'cover', // Ensures image covers entire area nicely
  },
  questionTextContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  // Answer Sections
  answerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  multipleChoice: {
    flex: 1,
  },
  writingSection: {
    flex: 1,
  },

  wordContentContainer: {
    backgroundColor: '#F7F9FC', // Light background color for the card
    borderRadius: 20,            // Rounded corners
    padding: 20,                 // Padding inside the card
    marginTop: 20,               // Space above the card
    shadowColor: '#000',         // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow direction
    shadowOpacity: 0.1,          // Shadow transparency
    shadowRadius: 10,            // Shadow spread
    elevation: 5,                // For Android shadow
    borderWidth: 1,              // Optional: add border around the card
    borderColor: '#E0E0E0',      // Light border color
    marginBottom: 10
  },
  
});

export default VocabTestScreen;