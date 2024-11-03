// QuestionComponents.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

// Navigation component for questions
export const QuestionNavigation = ({ questions, currentQuestion, questionStatus, onQuestionPress }) => {
  const [pressedQuestion, setPressedQuestion] = React.useState(null);

  const getQuestionStyle = (questionId) => {
    if (pressedQuestion === questionId) return styles.pressedQuestion;
    const status = questionStatus[questionId];
    if (status === 'review') return styles.reviewQuestion;
    if (status === 'answered') return styles.answeredQuestion;
    if (status === 'viewed') return styles.viewedQuestion;
    return styles.normalQuestion;
  };

  return (
    <View style={styles.questionNav}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {questions.map((question) => (
          <TouchableOpacity
            key={question.id}
            style={[styles.questionBtn, getQuestionStyle(question.id)]}
            onPress={() => onQuestionPress(question.id)}
            onPressIn={() => setPressedQuestion(question.id)}
            onPressOut={() => setPressedQuestion(null)}
            onLongPress={() => {
              Alert.alert('Marked', 'Question has been marked for review.');
            }}
            delayLongPress={500}
          >
            <Text
              style={[
                styles.questionBtnText,
                questionStatus[question.id] === 'answered' && styles.answeredQuestionText,
                questionStatus[question.id] === 'review' && styles.reviewQuestionText,
              ]}
            >
              {question.id}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Question Number component
export const QuestionNumber = ({ number }) => (
  <View style={styles.questionNumberContainer}>
    <Text style={styles.questionNumberText}>{number}</Text>
  </View>
);

// Options component
export const QuestionOptions = ({ question, selectedAnswer, onAnswerSelect }) => {
  const [pressedOption, setPressedOption] = React.useState(null);

  const renderOption = (option, index) => {
    const isSelected = selectedAnswer === option.label;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.optionButton,
          pressedOption === index && styles.pressedOption,
          isSelected && styles.selectedOption,
        ]}
        onPress={() => onAnswerSelect(question.id, option.label)}
        onPressIn={() => setPressedOption(index)}
        onPressOut={() => setPressedOption(null)}
      >
        <View style={styles.optionRow}>
          <View style={styles.radioButton}>
            <View style={[
              styles.radioInner,
              isSelected && styles.radioInnerSelected
            ]} />
          </View>
          <Text style={styles.optionText}>
            {option.label}. {option.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.optionsContainer}>
      {question.options.map((option, index) => renderOption(option, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Question Navigation Styles
  questionNav: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  questionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
  },
  questionBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  normalQuestion: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  viewedQuestion: {
    backgroundColor: '#E0F7FA',
    borderColor: '#4DD0E1',
  },
  answeredQuestion: {
    backgroundColor: '#C8E6C9',
    borderColor: '#4CAF50',
  },
  reviewQuestion: {
    backgroundColor: '#FFEB3B',
    borderColor: '#FFC107',
  },
  answeredQuestionText: {
    color: '#1B5E20',
  },
  reviewQuestionText: {
    color: '#FF9800',
  },

  // Question Number Styles
  questionNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // Options Styles
  optionsContainer: {
    marginLeft: 8,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pressedOption: {
    backgroundColor: '#B2EBF2',
  },
  selectedOption: {
    backgroundColor: '#F3F4F6',
    borderColor: '#4F46E5',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  radioInnerSelected: {
    backgroundColor: '#4F46E5',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    color: '#374151',
  },
});