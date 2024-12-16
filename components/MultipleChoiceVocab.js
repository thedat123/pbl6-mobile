import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const MultipleChoiceVocab = ({ 
  questionData, 
  onAnswer, 
  showCorrectAnswer, 
  selectedAnswer, 
  setSelectedAnswer 
}) => {
  const [isCorrect, setIsCorrect] = useState(null);

  if (!questionData) {
    console.error('MultipleChoiceVocab: No question data');
    return <View><Text>No question available</Text></View>;
  }

  if (!questionData.options || !Array.isArray(questionData.options)) {
    console.error('MultipleChoiceVocab: Invalid options', questionData);
    return <View><Text>Invalid question options</Text></View>;
  }

  useEffect(() => {
    setIsCorrect(null);
    setSelectedAnswer(null);
  }, [questionData]);

  const handleAnswer = (answer) => {
    if (!selectedAnswer) {
      const isAnswerCorrect = answer === questionData.correctAnswer;
      setSelectedAnswer(answer);
      setIsCorrect(isAnswerCorrect);
      onAnswer(isAnswerCorrect);
    }
  };

  const getOptionStyle = (option) => {
    if (showCorrectAnswer) {
      if (!selectedAnswer) {
        return styles.wrongOption;
      }
      if (option === questionData.correctAnswer) {
        return styles.correctOption;
      }
    }

    if (selectedAnswer === option) {
      return isCorrect ? styles.selectedCorrectOption : styles.wrongOption;
    }

    return {};
  };

  return (
    <View style={styles.optionsContainer}>
      {questionData.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, getOptionStyle(option)]}
          onPress={() => handleAnswer(option)}
          disabled={!!selectedAnswer || showCorrectAnswer}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    padding: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9', 
  },
  wrongOption: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  selectedCorrectOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#a5d6a7',
  },
});

export default MultipleChoiceVocab;
