import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { QuestionNavigation, QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const questions = [
  {
    id: 101,
    question: '----- the difference between the two brands is small, most consumers purchase the cheaper one.',
    options: [
      { id: 'A', text: 'Until' },
      { id: 'B', text: 'Because' },
      { id: 'C', text: 'Before' },
      { id: 'D', text: 'So' },
    ],
  },
  {
    id: 102,
    question: 'Audience members were impressed that the question asked of the candidate was answered -----.',
    options: [
      { id: 'A', text: 'clearly' },
      { id: 'B', text: 'clear' },
      { id: 'C', text: 'cleared' },
      { id: 'D', text: 'clearing' },
    ],
  },
  {
    id: 103,
    question: 'In an attempt ----- sustainable energy, city officials have had solar panels affixed to some public buildings.',
    options: [
      { id: 'A', text: 'generates' },
      { id: 'B', text: 'generated' },
      { id: 'C', text: 'generating' },
      { id: 'D', text: 'to generate' },
    ],
  },
];

const TestPart5 = () => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});

  const handleAnswerSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: 'answered'
    }));
  };

  const handleQuestionPress = (questionId) => {
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: 'viewed'
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <QuestionNavigation
          questions={questions}
          questionStatus={questionStatus}
          onQuestionPress={handleQuestionPress}
        />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {questions.map((question) => (
            <View key={question.id} style={styles.questionContainer}>
              <QuestionNumber number={question.id} />
              <Text style={styles.questionText}>{question.question}</Text>
              <QuestionOptions
                question={question}
                selectedAnswer={answers[question.id]}
                onAnswerSelect={handleAnswerSelect}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 12,
  },
});

export default TestPart5;
