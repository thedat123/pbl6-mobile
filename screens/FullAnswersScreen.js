import React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const FullAnswersScreen = ({ route }) => {
  const { allQuestions } = route.params;
  const { width } = useWindowDimensions();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {allQuestions.map((item, index) => (
        <View key={`question-${index}`} style={styles.questionCard}>
          <Text style={styles.questionNumber}>Question {index + 1}</Text>
          <Text style={styles.questionText}>{item.question}</Text>
          <Text style={styles.answerTitle}>Answer:</Text>
          <Text style={styles.answerText}>{item.answer}</Text>
          {item.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <RenderHtml
                contentWidth={width - 32}
                source={{ html: item.explanation }}
                baseStyle={styles.explanationText}
              />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  questionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 16,
    color: '#2563EB',
    marginBottom: 12,
  },
  explanationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
});

export default FullAnswersScreen;
