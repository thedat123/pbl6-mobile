import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import TimeCounter from '../components/TimeCounter';
import QuestionVocab from '../components/QuestionVocab';
import MultipleChoiceVocab from '../components/MultipleChoiceVocab';
import WritingVocab from '../components/WritingVocab'; 
import ProgressBar from '../components/ProgressBar'; // Import the new ProgressBar component

const VocabTestScreen = () => {
  const [progress, setProgress] = useState(1 / 20);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const questionData = {
    text: 'Chọn nghĩa đúng với từ vựng sau',
    word: 'Wedding (n)',
    options: ['Lễ cưới, đám cưới', '(việc) thêu, thêu thùa', 'Cảnh, phân cảnh', 'Đáp án khác'],
    correctAnswer: 'Lễ cưới, đám cưới',
    type: 'writing', // Can switch to 'writing' for writing type
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setProgress((prevProgress) => prevProgress + 1 / 20);
    }
  };

  const handleTimeOut = () => {
    setShowCorrectAnswer(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AntDesign name="close" size={24} color="black" />
        <TimeCounter initialTime={10} onTimeOut={handleTimeOut} />
        {/* Use the ProgressBar component */}
        <ProgressBar progress={progress} />
      </View>

      {/* Render the question */}
      <QuestionVocab questionData={questionData} />

      {/* Render answer options based on question type */}
      {questionData.type === 'multiple-choice' ? (
        <MultipleChoiceVocab
          questionData={questionData}
          onAnswer={handleAnswer}
          showCorrectAnswer={showCorrectAnswer}
        />
      ) : (
        <WritingVocab correctAnswer={questionData.correctAnswer} onAnswer={handleAnswer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});

export default VocabTestScreen;
