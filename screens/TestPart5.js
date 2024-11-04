import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const questionData = [
  {
    title: "Grammar Test Section",
    content: "Answer the following questions based on your understanding of grammar.",
    questions: [
      {
        id: 101,
        question: '----- the difference between the two brands is small, most consumers purchase the cheaper one.',
        options: [
          { label: 'A', text: 'Until' },
          { label: 'B', text: 'Because' },
          { label: 'C', text: 'Before' },
          { label: 'D', text: 'So' },
        ],
      },
      {
        id: 102,
        question: 'Audience members were impressed that the question asked of the candidate was answered -----.',
        options: [
          { label: 'A', text: 'clearly' },
          { label: 'B', text: 'clear' },
          { label: 'C', text: 'cleared' },
          { label: 'D', text: 'clearing' },
        ],
      },
      {
        id: 103,
        question: 'In an attempt ----- sustainable energy, city officials have had solar panels affixed to some public buildings.',
        options: [
          { label: 'A', text: 'generates' },
          { label: 'B', text: 'generated' },
          { label: 'C', text: 'generating' },
          { label: 'D', text: 'to generate' },
        ],
      },
    ],
  },
];

const TestPart5 = forwardRef((props, ref) => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});

  const handleAnswerSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setQuestionStatus((prev) => ({ ...prev, [questionId]: 'answered' }));
  };

  useImperativeHandle(ref, () => ({
    getQuestionData: () => questionData,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentWrapper}>
          {questionData.map((section, index) => (
            <View key={index} style={styles.content}>
              <Text style={styles.title}>{section.title}</Text>
              <Text style={styles.paragraph}>{section.content}</Text>
              {section.questions.map((question) => (
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
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  contentWrapper: { paddingTop: 8 },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  paragraph: { fontSize: 16, lineHeight: 24, marginBottom: 24, color: '#333' },
  questionContainer: { marginBottom: 24 },
  questionText: { fontSize: 16, lineHeight: 22, marginBottom: 12, color: '#333' },
});

export default TestPart5;
