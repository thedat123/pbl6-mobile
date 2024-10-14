import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const MultipleChoiceVocab = ({ questionData, onAnswer, showCorrectAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (showCorrectAnswer && !selectedAnswer) {
      // Automatically reveal the correct answer if time runs out and no answer is selected
      setSelectedAnswer(questionData.correctAnswer);
      setIsCorrect(false);
    }
  }, [showCorrectAnswer]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    const isAnswerCorrect = answer === questionData.correctAnswer;
    setIsCorrect(isAnswerCorrect);
    onAnswer(isAnswerCorrect);
  };

  return (
    <View style={styles.optionsContainer}>
      {questionData.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            selectedAnswer === option
              ? isCorrect
                ? styles.correctOption
                : styles.wrongOption
              : showCorrectAnswer && option === questionData.correctAnswer
              ? styles.correctOption
              : {},
          ]}
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
});

export default MultipleChoiceVocab;
