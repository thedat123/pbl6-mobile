import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const MultipleChoiceVocab = ({ questionData, onAnswer, showCorrectAnswer, selectedAnswer, setSelectedAnswer }) => {
  const [isCorrect, setIsCorrect] = useState(null);

  // Reset the answer state when the question changes
  useEffect(() => {
    setIsCorrect(null); // Reset correctness state for the new question
  }, [questionData]);

  useEffect(() => {
    if (showCorrectAnswer && !selectedAnswer) {
      // Automatically reveal the correct answer if time runs out and no answer is selected
      setSelectedAnswer(questionData.correctAnswer);
      setIsCorrect(false); // Đánh dấu là không đúng
    }
  }, [showCorrectAnswer]);

  const handleAnswer = (answer) => {
    if (!selectedAnswer) {  // Ensure that the user can't select more than once
      setSelectedAnswer(answer);
      const isAnswerCorrect = answer === questionData.correctAnswer;
      setIsCorrect(isAnswerCorrect);
      onAnswer(isAnswerCorrect);
    }
  };

  const getOptionStyle = (option) => {
    // Khi thời gian đã hết và không có câu trả lời nào được chọn
    if (showCorrectAnswer) {
      if (!selectedAnswer) {
        return styles.wrongOption; // Đáp án đúng hiển thị màu đỏ khi hết giờ
      }
      if (option === questionData.correctAnswer) {
        return styles.correctOption; // Đáp án đúng hiển thị màu xanh
      }
    }
    // Kiểm tra nếu người dùng đã chọn đáp án
    if (selectedAnswer === option) {
      return isCorrect ? styles.selectedCorrectOption : styles.wrongOption; // Đáp án người dùng chọn
    }

    return {}; // Không có style
  };

  return (
    <View style={styles.optionsContainer}>
      {questionData.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, getOptionStyle(option)]}
          onPress={() => handleAnswer(option)}
          disabled={!!selectedAnswer || showCorrectAnswer}  // Disable buttons if answer is selected or showing correct answer
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
    backgroundColor: '#e8f5e9', // Màu xanh nhạt cho đáp án đúng
  },
  wrongOption: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee', // Màu đỏ nhạt cho đáp án sai
  },
  selectedCorrectOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#a5d6a7',  // Màu xanh nhạt hơn cho đáp án đúng được chọn
  },
});

export default MultipleChoiceVocab;
