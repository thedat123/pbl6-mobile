import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // Import hook cho điều hướng

const VocabCard = () => {
  const navigation = useNavigation();  // Lấy đối tượng điều hướng

  return (
    <SafeAreaView>
      <View style={styles.safeArea}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("VocabDetailScreen")}>
          <Image 
            source={require('../assets/images/Vocab/vocab_image.png')}
            style={styles.image}
          />
          <Text style={styles.title}>2024 Practice Set TOEIC Test 10</Text>
          
          {/* Tag section */}
          <View style={styles.tagContainer}>
            <View style={[styles.tag, { backgroundColor: 'green' }]}>
              <Text style={styles.tagText}>Medium</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: 'orange' }]}>
              <Text style={styles.tagText}>Biology</Text>
            </View>
          </View>
          
          {/* Footer section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>by EngFlash</Text>
          </View>
        </TouchableOpacity>    
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
  },
  footerContainer: {
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});

export default VocabCard;
