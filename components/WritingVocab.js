import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const WritingVocab = ({ correctAnswer, onAnswer, isTimeUp }) => {
  const [inputText, setInputText] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  // Ensure hooks are not conditionally called
  useEffect(() => {
    if (isTimeUp) {
      handleCheckAnswer(true);
    }
  }, [isTimeUp]);

  // Handle answer submission or timeout
  const handleCheckAnswer = (isTimeout = false) => {
    if (isTimeout) {
      setInputText(correctAnswer); // Show the correct answer on timeout
      setIsCorrect(false); // Mark as incorrect
      onAnswer(false); // Notify parent of incorrect answer
    } else {
      const trimmedAnswer = inputText.trim().toLowerCase();
      const isAnswerCorrect = trimmedAnswer === correctAnswer.toLowerCase();
      setIsCorrect(isAnswerCorrect);
      onAnswer(isAnswerCorrect);
      
      // If the answer is incorrect, immediately show the correct answer
      if (!isAnswerCorrect) {
        setInputText(correctAnswer); // Update input to show the correct answer
      }
    }
  };

  // Check if input should be editable based on isCorrect
  const isEditable = isCorrect === null || isCorrect === true;

  return (
    <View style={styles.container}>
      {/* Answer Input */}
      <TextInput
        style={[
          styles.inputBox,
          isCorrect === true && styles.inputCorrect,
          isCorrect === false && styles.inputIncorrect,
        ]}
        placeholder="Type your answer here..."
        value={inputText}
        onChangeText={setInputText}
        autoCapitalize="none"
        autoCorrect={false}
        editable={isEditable} // Disable editing if answer is incorrect
      />

      {/* Check Answer Button */}
      {!isTimeUp && (
        <TouchableOpacity
          style={[styles.checkButton, inputText.trim() && styles.checkButtonEnabled]}
          onPress={() => handleCheckAnswer(false)}
          disabled={inputText.trim() === ''}
        >
          <Text style={styles.checkButtonText}>CHECK ANSWER</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 30,
    marginVertical: 20,
    width: '90%',
    alignSelf: 'center',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ddd', // Default border color
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    width: '100%',
    backgroundColor: '#f9f9f9',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputCorrect: {
    borderColor: '#4CAF50', // Green border when the answer is correct
  },
  inputIncorrect: {
    borderColor: '#F44336', // Red border when the answer is incorrect
  },
  checkButton: {
    backgroundColor: '#E0E0E0', // Grey background when disabled
    borderRadius: 30, // Rounded button for modern feel
    paddingVertical: 15,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    width: '80%',
    marginTop: 10,
  },
  checkButtonEnabled: {
    backgroundColor: '#00C853', // Green background when enabled
  },
  checkButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default WritingVocab;
