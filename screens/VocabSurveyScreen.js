import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const VocabSurveyScreen = () => {
  const [known, setKnown] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={styles.progress} />
      </View>
      <View style={styles.card}>
        <Image
          style={styles.image}
          source={require('../assets/images/Vocab/love.png')}
        />
        <Text style={styles.word}>date (n)</Text>
        <Text style={styles.pronunciation}>/deit/</Text>
      </View>
      <Text style={styles.question}>Bạn biết từ vựng này hay không?</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.unknownButton]}
          onPress={() => setKnown(false)}
          activeOpacity={0.7} // Add feedback on press
        >
          <Text style={styles.buttonText}>CHƯA BIẾT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.knownButton]}
          onPress={() => setKnown(true)}
          activeOpacity={0.7} // Add feedback on press
        >
          <Text style={styles.buttonText}>ĐÃ BIẾT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  progressBar: {
    height: 10,
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    width: '50%', // Adjust this value to reflect actual progress
    backgroundColor: '#4caf50',
    borderRadius: 5,
  },
  card: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    width: '90%', // Adjust width for better spacing
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  word: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center', // Center align for better readability
  },
  pronunciation: {
    fontSize: 22,
    color: '#555',
    marginBottom: 10,
  },
  question: {
    fontSize: 22,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center', // Center align for better readability
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Even spacing between buttons
    width: '100%',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    width: '40%', // Adjust width for better button sizes
    alignItems: 'center',
  },
  unknownButton: {
    backgroundColor: '#e74c3c',
  },
  knownButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VocabSurveyScreen;
