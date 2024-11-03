import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, Image, FlatList, SafeAreaView, 
  StyleSheet, TextInput, TouchableOpacity, Modal,
  Animated, Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45; // Tăng width một chút
const CARD_HEIGHT = height * 0.26; // Tăng height để có thêm không gian

const TopicCard = ({ item, onPress }) => {
  const animatedScale = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <Animated.View style={[
        styles.topicCard,
        { transform: [{ scale: animatedScale }] }
      ]}>
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.cardGradient}
        >
          <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.topicImage} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.topicTitle}>{item.title}</Text>
            <View style={styles.progressWrapper}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={['#4CAF50', '#81C784']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBar, { width: '35%' }]}
                />
              </View>
              <Text style={styles.progressText}>7/20 từ vựng</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const StatBox = ({ label, value, icon }) => (
  <View style={styles.statBox}>
    <LinearGradient
      colors={['#ffffff', '#f8f9fa']}
      style={styles.statGradient}
    >
      <FontAwesome5 name={icon} size={24} color="#4CAF50" />
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  </View>
);

const ReviewSection = ({ review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewerInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{review.userName[0]}</Text>
        </View>
        <Text style={styles.reviewerName}>{review.userName}</Text>
      </View>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <FontAwesome5 
            key={i}
            name="star"
            solid={i < review.rating}
            size={16}
            color={i < review.rating ? '#FFD700' : '#E0E0E0'}
          />
        ))}
      </View>
    </View>
    <Text style={styles.reviewText}>{review.review}</Text>
  </View>
);

const TopicModal = ({ visible, topic, onClose, onLearn }) => (
  <Modal
    animationType="slide"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.modalGradient}
        >
          {topic && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{topic.title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <FontAwesome5 name="times" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Image source={topic.image} style={styles.modalImage} />
              <Text style={styles.modalDescription}>
                Học các từ vựng về chủ đề {topic.title.toLowerCase()} 
                để nâng cao vốn từ của bạn.
              </Text>
              <TouchableOpacity
                style={styles.learnButton}
                onPress={onLearn}
              >
                <LinearGradient
                  colors={['#4CAF50', '#81C784']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.learnButtonGradient}
                >
                  <Text style={styles.learnButtonText}>Bắt đầu học</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
      </View>
    </View>
  </Modal>
);

const VocabDetailScreen = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);

  // Theo dõi sự kiện bàn phím
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Tự động scroll đến phần comment khi bàn phím hiện
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const topics = [
    { id: 1, title: 'JOB', image: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/job.png' }},
    { id: 2, title: 'LOVE', image: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/love.png' } },
    { id: 3, title: 'FRIENDSHIP', image: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/love.png' } },
    { id: 4, title: 'FAMILY', image: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/love.png' } },
  ];

  const stats = [
    { label: 'Bài đã học', value: 1, icon: 'book-open' },
    { label: 'Bài chưa học', value: 7, icon: 'book' },
    { label: 'Từ đã thuộc', value: 24, icon: 'check-circle' },
    { label: 'Từ chưa thuộc', value: 16, icon: 'circle' },
  ];

  const review = {
    userName: 'Khanh',
    rating: 4,
    review: 'Rất hài lòng với ứng dụng, giao diện đẹp và dễ sử dụng',
  };

  const handleSubmitComment = () => {
    // Xử lý gửi comment
    if (message.trim()) {
      // TODO: Implement comment submission
      setMessage('');
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <LinearGradient
          colors={['#f8f9fa', '#ffffff']}
          style={styles.gradient}
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Topics Section */}
            <FlatList
              data={topics}
              renderItem={({ item }) => (
                <TopicCard 
                  item={item}
                  onPress={() => {
                    setSelectedTopic(item);
                    setModalVisible(true);
                  }}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicList}
              snapToInterval={CARD_WIDTH + 20}
              decelerationRate="fast"
              keyExtractor={item => item.id.toString()}
              scrollEventThrottle={16}
            />

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Tiến độ học tập</Text>
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <StatBox key={index} {...stat} />
                ))}
              </View>
            </View>

            {/* Reviews Section */}
            <View style={styles.reviewsContainer}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              <ReviewSection review={review} />
            </View>

            {/* Comment Section */}
            <View style={[styles.commentContainer, { marginBottom: keyboardHeight > 0 ? keyboardHeight : 20 }]}>
              <Text style={styles.sectionTitle}>Nhận xét của bạn</Text>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Chia sẻ cảm nhận của bạn..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={500}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={handleSubmitComment}
                />
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSubmitComment}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#81C784']}
                    style={styles.sendButtonGradient}
                  >
                    <FontAwesome5 name="paper-plane" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      <TopicModal
        visible={modalVisible}
        topic={selectedTopic}
        onClose={() => setModalVisible(false)}
        onLearn={() => {
          navigation.navigate("VocabLearnScreen", { selectedTopic });
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    flexGrow: 1,
  },
  topicList: {
    paddingVertical: 20,
  },
  topicCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
  },
  cardGradient: {
    flex: 1,
    padding: 15, // Giảm padding để có thêm không gian
  },
  imageContainer: {
    height: '60%', // Chiếm 60% chiều cao card
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  topicImage: {
    width: '90%', // Giảm width một chút để tránh bị cắt
    height: '90%',
    resizeMode: 'contain',
  },
  cardContent: {
    height: '40%', // Phần còn lại cho title và progress
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  topicTitle: {
    fontSize: 22, // Giảm font size một chút
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  progressWrapper: {
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8, // Giảm chiều cao của progress bar
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 5,
    fontSize: 14, // Giảm font size
    color: '#333',
    fontWeight: '500',
  },
  statsContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  statBox: {
    width: width / 4.5,
    alignItems: 'center',
  },
  statGradient: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  reviewsContainer: {
    marginVertical: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  reviewCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: '#fff',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
  },
  commentContainer: {
    paddingVertical: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    minHeight: 45,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButton: {
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  sendButtonGradient: {
    padding: 12,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  learnButton: {
    alignSelf: 'center',
  },
  learnButtonGradient: {
    padding: 10,
    borderRadius: 10,
  },
  learnButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default VocabDetailScreen;
