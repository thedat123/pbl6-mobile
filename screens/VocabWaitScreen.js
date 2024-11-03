import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import if you use Expo
import { useNavigation } from '@react-navigation/native';

const VocabWaitScreen = () => {
  const navigation = useNavigation(); // Initialize navigation
  return (
    <LinearGradient
      colors={['#f7f8fa', '#d6e4ff']} // Soft gradient background
      style={styles.container}
    >
      {/* Image Section */}
      <Image
        source={{ uri: 'http://192.168.100.101:8081/assets/images/Vocab/finish.png' }}
        style={styles.image}
      />
      {/* Message Section */}
      <Text style={styles.message}>Bạn vừa hoàn thành phần từ vựng</Text>
      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonContinue} activeOpacity={0.8} onPress={() => navigation.navigate('VocabLearnScreen')}>
          <Text style={styles.buttonText}>HỌC LẠI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonCheck} activeOpacity={0.8} onPress={() => navigation.navigate('VocabTestScreen')}>
          <Text style={styles.buttonText}>KIỂM TRA</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#4caf50', // Green color for 'HỌC TIẾP' button
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
    backgroundColor: '#2196f3', // Blue color for 'KIỂM TRA'
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
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16, // Larger font size for better visibility
  },
});

export default VocabWaitScreen;
