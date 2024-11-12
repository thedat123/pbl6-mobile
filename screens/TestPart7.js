import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import ImageViewing from 'react-native-image-viewing'; // Make sure you have installed this package
import { QuestionNumber, QuestionOptions } from '../components/QuestionTest'; // Ensure these components are defined

const TestPart7 = forwardRef((props, ref) => {
  const [questionStatus, setQuestionStatus] = useState({});
  const [answers, setAnswers] = useState({});
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const questionData = [
    {
      imageUrl: "https://lh6.googleusercontent.com/xaeQedCrz-uD-_tJEOcLFQtAj2k1nIdQcKTyNSP9_iM9h4VHkInFqgYYCIr7jw1q_6ja4zjIS6-gyPJPJa4VS80pwDkeBL3NzCzESM9-S6p-qp3Aepd_4WY1PZ1QT0_FnAy38se9",
      questions: [
        {
          id: 147,
          questionText: "What is indicated about TriStar Sports Gear?",
          options: [
            { label: "A", text: "It is a family business." },
            { label: "B", text: "It is located next to a school." },
            { label: "C", text: "It holds a sale every year." },
            { label: "D", text: "It mainly sells weight training equipment." }
          ]
        },
        {
          id: 148,
          questionText: "How can customers receive a discount on athletic shoes?",
          options: [
            { label: "A", text: "By buying more than two pairs" },
            { label: "B", text: "By visiting on July 1" },
            { label: "C", text: "By placing an order online" },
            { label: "D", text: "By presenting a flyer" }
          ]
        }
      ],
    },
    {
      imageUrl: "https://lh6.googleusercontent.com/xaeQedCrz-uD-_tJEOcLFQtAj2k1nIdQcKTyNSP9_iM9h4VHkInFqgYYCIr7jw1q_6ja4zjIS6-gyPJPJa4VS80pwDkeBL3NzCzESM9-S6p-qp3Aepd_4WY1PZ1QT0_FnAy38se9",
      questions: [
        {
          id: 135,
          questionText: "What does XYZ Company signify?",
          options: [
            { label: "A", text: "growing" },
            { label: "B", text: "shrinking" },
            { label: "C", text: "stable" },
            { label: "D", text: "declining" }
          ]
        },
        {
          id: 136,
          questionText: "What is a fact about XYZ Company?",
          options: [
            { label: "A", text: "XYZ Company has been serving the community for over 20 years." },
            { label: "B", text: "We are new to the area." },
            { label: "C", text: "We have been facing financial difficulties." },
            { label: "D", text: "XYZ Company is on the verge of closing down." }
          ]
        },
      ],
    }
  ];

  const handleSelectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setQuestionStatus((prev) => ({ ...prev, [questionId]: 'answered' }));
  };

  useImperativeHandle(ref, () => ({
    getQuestionData: () => questionData,
  }));

  const openImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {questionData.map((item, index) => (
          <View key={index} style={styles.questionBlock}>
            {/* Image Section */}
            <TouchableOpacity onPress={() => openImageViewer(item.imageUrl)} style={styles.imageContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
            </TouchableOpacity>

            {/* Questions Section */}
            {item.questions.map((question) => (
              <View key={question.id} style={styles.questionContainer}>
                <QuestionNumber number={question.id} />
                <QuestionOptions
                  question={{ id: question.id, question: question.questionText, options: question.options }}
                  selectedAnswer={answers[question.id]}
                  onAnswerSelect={handleSelectAnswer}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Image Viewer Modal */}
      <ImageViewing
        images={[{ uri: selectedImage }]}
        imageIndex={0}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  questionBlock: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  questionContainer: {
    padding: 16,
  },
});

export default TestPart7;
