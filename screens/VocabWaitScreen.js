import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import if you use Expo
import { useNavigation, useRoute } from '@react-navigation/native';
import VocabImage from '../assets/images/Vocab/finish.svg'; // Ensure SVG handling as discussed previously

const VocabWaitScreen = () => {
  const navigation = useNavigation();
  const route = useRoute(); 
  const { topicId } = route.params;  

  return (
    <LinearGradient
      colors={['#f7f8fa', '#d6e4ff']} // Soft gradient background
      style={styles.container}
    >
      <VocabImage style={styles.image} />
      <Text style={styles.message}>You have just completed the vocabulary section</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonContinue}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('VocabLearnScreen', { topicId: topicId })}
        >
          <Text style={styles.buttonText}>LEARN AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonCheck}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('VocabTestScreen', { topicId: topicId })}
        >
          <Text style={styles.buttonText}>TAKE TEST</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.buttonHome}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('MainAppNavigator')}  // Adjust the screen name as needed
      >
        <Text style={styles.buttonText}>GO BACK TO HOME</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  image: {
    width: 220, // Adjusted size for larger display
    height: 220,
    marginBottom: 30,
  },
  message: {
    fontSize: 20, // Increased font size for better readability
    fontWeight: 'bold',
    color: '#333333', // Darker color for contrast
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20, // Extra padding for button alignment
  },
  buttonContinue: {
    flex: 1,
    backgroundColor: '#4caf50', // Green color for 'LEARN AGAIN' button
    borderRadius: 10, // More rounded for a modern look
    paddingVertical: 15,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000', // Shadow effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonCheck: {
    flex: 1,
    backgroundColor: '#2196f3', // Blue color for 'TAKE TEST'
    borderRadius: 10,
    paddingVertical: 15,
    marginLeft: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonHome: {
    marginTop: 20,
    backgroundColor: '#ff5722', // Orange color for 'GO BACK TO HOME'
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16, 
  },
});

export default VocabWaitScreen;
