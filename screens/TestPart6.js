import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const TestPart6 = forwardRef((props, ref) => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});

  const questionData = [
    {
      title: "Urgent! Journeyman Plumber Needed",
      content: "Ace Plumbing is looking for an experienced plumber to join our _____(131) business here in Columbia. _____(132)...",
      questions: [
        { id: 131, options: [{ label: "A", text: "expanding" }, { label: "B", text: "expecting" }, { label: "C", text: "contracting" }, { label: "D", text: "controlling" }] },
        { id: 132, options: [{ label: "A", text: "Ace Plumbing has been servicing the Columbia area since 1954." }, { label: "B", text: "We have little connection to the community." }, { label: "C", text: "We have been struggling to pay our bills." }, { label: "D", text: "Ace Plumbing is in financial trouble." }] },
        { id: 133, options: [{ label: "A", text: "monstrous" }, { label: "B", text: "dramatic" }, { label: "C", text: "impossible" }, { label: "D", text: "insane" }] },
        { id: 134, options: [{ label: "A", text: "pieces" }, { label: "B", text: "flows" }, { label: "C", text: "installations" }, { label: "D", text: "types" }] },
      ],
    },
    {
      title: "Another Job Opportunity",
      content: "XYZ Company is seeking a skilled electrician to join our _____(135) team. _____(136)...",
      questions: [
        { id: 135, options: [{ label: "A", text: "growing" }, { label: "B", text: "shrinking" }, { label: "C", text: "stable" }, { label: "D", text: "declining" }] },
        { id: 136, options: [{ label: "A", text: "XYZ Company has been serving the community for over 20 years." }, { label: "B", text: "We are new to the area." }, { label: "C", text: "We have been facing financial difficulties." }, { label: "D", text: "XYZ Company is on the verge of closing down." }] },
        { id: 137, options: [{ label: "A", text: "decreasing" }, { label: "B", text: "steady" }, { label: "C", text: "increasing" }, { label: "D", text: "fluctuating" }] },
        { id: 138, options: [{ label: "A", text: "aspects" }, { label: "B", text: "types" }, { label: "C", text: "pieces" }, { label: "D", text: "flows" }] },
      ],
    },
  ];

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
          {questionData.map((passage, index) => (
            <View key={index} style={styles.content}>
              <Text style={styles.title}>{passage.title}</Text>
              <Text style={styles.paragraph}>{passage.content}</Text>
              {passage.questions.map((question) => (
                <View key={question.id} style={styles.questionContainer}>
                  <QuestionNumber number={question.id} />
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
});

export default TestPart6;
