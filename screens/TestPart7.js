import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import ImageViewing from 'react-native-image-viewing';

const TestPart7 = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const data = [
    {
      imageUrl: "https://lh6.googleusercontent.com/xaeQedCrz-uD-_tJEOcLFQtAj2k1nIdQcKTyNSP9_iM9h4VHkInFqgYYCIr7jw1q_6ja4zjIS6-gyPJPJa4VS80pwDkeBL3NzCzESM9-S6p-qp3Aepd_4WY1PZ1QT0_FnAy38se9",
      questions: [
        {
          id: 147,
          questionText: "What is indicated about TriStar Sports Gear?",
          options: [
            "A. It is a family business.",
            "B. It is located next to a school.",
            "C. It holds a sale every year.",
            "D. It mainly sells weight training equipment."
          ]
        },
        {
          id: 148,
          questionText: "How can customers receive a discount on athletic shoes?",
          options: [
            "A. By buying more than two pairs",
            "B. By visiting on July 1",
            "C. By placing an order online",
            "D. By presenting a flyer"
          ]
        }
      ]
    },
    {
      imageUrl: "https://lh6.googleusercontent.com/xaeQedCrz-uD-_tJEOcLFQtAj2k1nIdQcKTyNSP9_iM9h4VHkInFqgYYCIr7jw1q_6ja4zjIS6-gyPJPJa4VS80pwDkeBL3NzCzESM9-S6p-qp3Aepd_4WY1PZ1QT0_FnAy38se9",
      questions: [
        {
          id: 149,
          questionText: "What kind of movie did Phyllis think the group was going to see?",
          options: [
            "A. Horror",
            "B. Sci Fi",
            "C. Comedy",
            "D. Romance"
          ]
        },
        {
          id: 150,
          questionText: "Where did the group decide to meet?",
          options: [
            "A. At the cinema",
            "B. At a restaurant",
            "C. At Sylvia's house",
            "D. At the park"
          ]
        }
      ]
    }
  ];

  const handleSelectAnswer = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const openImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.questionBlock}>
          {/* Image Section */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => openImageViewer(item.imageUrl)}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Questions Section */}
          <View style={styles.questionsContainer}>
            {item.questions.map((question, qIndex) => (
              <View key={qIndex} style={styles.questionContainer}>
                <Text style={styles.questionNumber}>Question {question.id}</Text>
                <Text style={styles.questionText}>{question.questionText}</Text>
                
                <View style={styles.optionsContainer}>
                  {question.options.map((option, optionIndex) => (
                    <TouchableOpacity
                      key={optionIndex}
                      style={styles.optionButton}
                      onPress={() => handleSelectAnswer(question.id, optionIndex)}
                    >
                      <View style={[
                        styles.radio,
                        selectedAnswers[question.id] === optionIndex && styles.radioSelected
                      ]} />
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
      
      {/* Image Viewer Modal */}
      <ImageViewing
        images={[{ uri: selectedImage }]}
        imageIndex={0}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
  },
  questionsContainer: {
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionNumber: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginLeft: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#2196F3',
  },
  optionText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
});

export default TestPart7;
