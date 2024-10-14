import React, { useState } from 'react';
import { View, Text, Image, FlatList, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const VocabDetailScreen = () => {
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    { id: 1, title: 'JOB', image: require('../assets/images/Vocab/job.png') },
    { id: 2, title: 'LOVE', image: require('../assets/images/Vocab/love.png') },
    { id: 3, title: 'FRIENDSHIP', image: require('../assets/images/Vocab/love.png') },
    { id: 4, title: 'FAMILY', image: require('../assets/images/Vocab/love.png') },
  ];

  const progressStats = [
    { label: 'Bài đã học', value: 1 },
    { label: 'Bài chưa học', value: 7 },
    { label: 'Từ đã thuộc', value: 24 },
    { label: 'Từ chưa thuộc', value: 16 },
  ];

  const userReview = {
    userName: 'Khanh',
    rating: 4,
    review: 'Rất hài lòng',
  };

  const handleTopicPress = (topic) => {
    setSelectedTopic(topic);
    setModalVisible(true);
  };

  const handleLearnVocabPress = () => {
    // Navigate to the vocabulary learning section
    // This could be a navigation action or setting a state to show the learning section
    console.log('Navigate to learning section for:', selectedTopic.title);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content Section */}
      <View style={styles.content}>
        <FlatList
          data={topics}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleTopicPress(item)} style={styles.topicItem}>
              <Image source={item.image} style={styles.topicImage} />
              <Text style={styles.topicTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={true} // Enable horizontal scroll bar
        />

        {/* Progress Stats */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Tiến độ của bạn</Text>
          <View style={styles.progressStats}>
            {progressStats.map((stat, index) => (
              <View key={index} style={styles.statBox}>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statText}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* User Review Section */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>Đánh giá của bạn học</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.userName}>{userReview.userName}</Text>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, index) => (
                <Text key={index} style={styles.star}>
                  {index < userReview.rating ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
          </View>
          <Text style={styles.reviewText}>{userReview.review}</Text>
        </View>

        {/* Message Input Section */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Nhận xét của bạn</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập nhận xét của bạn"
            placeholderTextColor="#999"
          />  
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for Topic Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTopic && (
              <>
                <Text style={styles.modalTitle}>{selectedTopic.title}</Text>
                <Image source={selectedTopic.image} style={styles.modalImage} />
                <Text style={styles.modalDescription}>Description for {selectedTopic.title}</Text>
                <TouchableOpacity
                  style={styles.learnButton}
                  onPress={handleLearnVocabPress}
                >
                  <Text style={styles.learnButtonText}>Học từ vựng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  topicItem: {
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: 'white',
    padding: 10,
  },
  topicImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  topicTitle: {
    fontSize: 20,
    marginTop: 5,
    color: '#333',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  progressTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statText: {
    fontSize: 14,
    color: '#555',
  },
  ratingContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  ratingTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 16,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 20,
  },
  reviewText: {
    color: '#777',
    marginTop: 5,
    fontStyle: 'italic',
  },
  messageContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  messageTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  learnButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  learnButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VocabDetailScreen;
