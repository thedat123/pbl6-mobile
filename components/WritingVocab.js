import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';

const WritingVocab = ({ correctAnswer, onAnswer, isTimeUp }) => {
  const [inputText, setInputText] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isTimeUp) {
      handleCheckAnswer(true);
    }
  }, [isTimeUp]);

  const handleCheckAnswer = (isTimeout = false) => {
    Keyboard.dismiss(); // Dismiss keyboard after checking
    
    if (isTimeout) {
      setInputText(correctAnswer);
      setIsCorrect(false);
      onAnswer(false);
      setShowHint(true);
    } else {
      const trimmedAnswer = inputText.trim().toLowerCase();
      const isAnswerCorrect = trimmedAnswer === correctAnswer.toLowerCase();
      
      setIsCorrect(isAnswerCorrect);
      onAnswer(isAnswerCorrect);
      
      if (!isAnswerCorrect) {
        setInputText(correctAnswer);
        setShowHint(true);
      }
    }
  };

  const handleReset = () => {
    setInputText('');
    setIsCorrect(null);
    setShowHint(false);
  };

  const isEditable = isCorrect === null || isCorrect === true;

  return (
    <View style={styles.container}>
      {/* Input Section */}
      <View style={styles.inputContainer}>
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
          editable={isEditable}
          placeholderTextColor="#999"
        />
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        {/* Check Answer Button */}
        {!isTimeUp && isCorrect === null && (
          <TouchableOpacity
            style={[
              styles.button, 
              styles.checkButton,
              inputText.trim() && styles.checkButtonEnabled
            ]}
            onPress={() => handleCheckAnswer(false)}
            disabled={inputText.trim() === ''}
          >
            <Text style={styles.buttonText}>CHECK ANSWER</Text>
          </TouchableOpacity>
        )}

        {/* Reset/Try Again Button */}
        {isCorrect === false && (
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>TRY AGAIN</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F9FC',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputBox: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  inputIncorrect: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  hintContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
  },
  hintText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkButton: {
    backgroundColor: '#E0E0E0',
  },
  checkButtonEnabled: {
    backgroundColor: '#00C853',
  },
  resetButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default WritingVocab;