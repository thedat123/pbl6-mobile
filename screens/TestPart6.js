import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest';

const TestPart6 = forwardRef(({ onQuestionStatusChange }, ref) => {
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const questionData = [
    {
      title: "Urgent! Journeyman Plumber Needed",
      content: "Ace Plumbing is looking for an experienced plumber to join our _____(131) business here in Columbia. _____(132)...",
      questions: [
        { id: 131, options: [{ label: "A", text: "expanding", isCorrect: true  }, { label: "B", text: "expecting", isCorrect: false }, { label: "C", text: "contracting", isCorrect: false }, { label: "D", text: "controlling", isCorrect: false }], correctAnswer: 'A' },
        { id: 132, options: [{ label: "A", text: "Ace Plumbing has been servicing the Columbia area since 1954.", isCorrect: true }, { label: "B", text: "We have little connection to the community.", isCorrect: false }, { label: "C", text: "We have been struggling to pay our bills.", isCorrect: false }, { label: "D", text: "Ace Plumbing is in financial trouble.", isCorrect: false }], correctAnswer: 'A'},
        { id: 133, options: [{ label: "A", text: "monstrous", isCorrect: true }, { label: "B", text: "dramatic", isCorrect: false }, { label: "C", text: "impossible", isCorrect: false }, { label: "D", text: "insane", isCorrect: false }], correctAnswer: 'A'},
        { id: 134, options: [{ label: "A", text: "pieces", isCorrect: true }, { label: "B", text: "flows", isCorrect: false }, { label: "C", text: "installations", isCorrect: false }, { label: "D", text: "types", isCorrect: false }], correctAnswer: 'A'},
      ],
    },
    {
      title: "Another Job Opportunity",
      content: "XYZ Company is seeking a skilled electrician to join our _____(135) team. _____(136)...",
      questions: [
        { id: 135, options: [{ label: "A", text: "growing", isCorrect: true }, { label: "B", text: "shrinking", isCorrect: false }, { label: "C", text: "stable", isCorrect: false }, { label: "D", text: "declining", isCorrect: false }], correctAnswer: 'A'},
        { id: 136, options: [{ label: "A", text: "XYZ Company has been serving the community for over 20 years." , isCorrect: true}, { label: "B", text: "We are new to the area.", isCorrect: false }, { label: "C", text: "We have been facing financial difficulties.", isCorrect: false }, { label: "D", text: "XYZ Company is on the verge of closing down." }], correctAnswer: 'A'},
        { id: 137, options: [{ label: "A", text: "decreasing", isCorrect: true }, { label: "B", text: "steady", isCorrect: false }, { label: "C", text: "increasing", isCorrect: false }, { label: "D", text: "fluctuating", isCorrect: false}], correctAnswer: 'A'},
        { id: 138, options: [{ label: "A", text: "aspects", isCorrect: true }, { label: "B", text: "types", isCorrect: false }, { label: "C", text: "pieces", isCorrect: false }, { label: "D", text: "flows", isCorrect: false}], correctAnswer: 'A'},
      ],
    },
  ];

  const handleAnswerSelect = (questionId, option) => {
    setAnswers((prev) => ({ 
      ...prev, 
      [questionId]: option 
    }));
    
    const newStatus = { 
      [questionId]: option ? 'answered' : 'viewed' 
    };
    
    setQuestionStatus((prev) => ({ 
      ...prev, 
      ...newStatus 
    }));
    
    if (onQuestionStatusChange) {
      onQuestionStatusChange(newStatus);
    }
  };

  useImperativeHandle(ref, () => ({
    getQuestionData: () => questionData,
    getQuestionStatus: () => questionStatus,
    getAnswers: () => answers,
    getTestDuration: () => {
      return Math.floor((Date.now() - startTime) / 1000);
    }
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
