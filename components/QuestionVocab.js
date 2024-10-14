import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QuestionVocab = ({ questionData }) => {
  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{questionData.text}</Text>
        <View style={styles.wordBox}>
          <Text style={styles.word}>{questionData.word}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  question: {
    fontSize: 20,
    marginBottom: 10,
  },
  wordBox: {
    borderWidth: 1,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default QuestionVocab;
