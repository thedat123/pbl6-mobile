import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WordContent = ({ word, currentView, handleSpeak, handleSpeakExample }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  if (!word) {
    return <Text style={styles.noDataText}>No word data available</Text>;
  }

  const {
    word: wordText,
    pronunciation,
    definition,
    example,
    translate,
    thumbnail,
    wordClass,
    audio,
    exampleAudio,
  } = word;

  const renderWordView = () => (
    <View style={styles.wordContainer}>
      <Text style={styles.word}>
        {wordText} <Text style={styles.wordClass}>({wordClass})</Text>
      </Text>
      <Text style={styles.pronunciation}>{pronunciation}</Text>
      <TouchableOpacity style={styles.speakButton} onPress={() => handleSpeak(audio)}>
        <Icon name="volume-up" size={28} color="#ffffff" />
        <Text style={styles.speakText}>Speak</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDefinitionView = () => (
    <View style={styles.definitionContainer}>
      <Text style={styles.definitionTitle}>Definition</Text>
      <Text style={styles.definition}>{definition || 'No definition available'}</Text>
    </View>
  );

  const renderExampleView = () => (
    <View style={styles.exampleContainer}>
      {thumbnail && <Image source={{ uri: thumbnail }} style={styles.thumbnail} />}
      <Text style={styles.wordExample}>{wordText}</Text>
      <Text style={styles.exampleText}>Example:</Text>
      <Text style={styles.example}>{example}</Text>
      <TouchableOpacity style={styles.speakButton} onPress={() => handleSpeakExample(exampleAudio)}>
        <Icon name="volume-up" size={28} color="#ffffff" />
        <Text style={styles.speakText}>Speak Example</Text>
      </TouchableOpacity>
      <Text style={styles.translationText}>Translation:</Text>
      <Text style={styles.translation}>{translate}</Text>
    </View>
  );

  switch (currentView) {
    case 0:
      return renderDefinitionView();
    case 1:
      return renderWordView();
    case 2:
      return renderExampleView();
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  noDataText: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 20,
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  word: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  wordClass: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#2C3E82',
  },
  pronunciation: {
    fontSize: 16,
    color: '#2C3E82',
    marginTop: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E82',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    elevation: 3,
  },
  speakText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 5,
  },
  definitionContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  definitionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E82',
    marginBottom: 10,
  },
  definition: {
    fontSize: 18,
    color: '#2C3E82',
    textAlign: 'center',
    lineHeight: 24,
  },
  exampleContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  wordExample: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 18,
    color: '#2C3E82',
    marginTop: 15,
    fontWeight: 'bold',
  },
  example: {
    fontSize: 16,
    color: '#2C3E82',
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 10,
  },
  translationText: {
    fontSize: 18,
    color: '#2C3E82',
    fontWeight: 'bold',
    marginTop: 20,
  },
  translation: {
    fontSize: 16,
    color: '#2C3E82',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default WordContent;
