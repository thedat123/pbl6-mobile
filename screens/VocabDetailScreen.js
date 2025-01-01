import React, { useEffect, useRef, useState } from 'react';
import { 
  View, Text, Image, FlatList, SafeAreaView, 
  StyleSheet, TextInput, TouchableOpacity, Modal,
  Animated, Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  LogBox
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pagination from '../components/Pagination';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.5; 
const CARD_HEIGHT = height * 0.4; 
const ITEMS_PER_PAGE = 4;

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
]);

const TopicCard = ({ item, onPress }) => {
  const animatedScale = new Animated.Value(1);
  const navigation = useNavigation();

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
            <Image source={{ uri: item.thumbnail }} style={styles.topicImage} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.topicTitle}>{item.name}</Text>
            <View style={styles.progressWrapper}>
              <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={['#4CAF50', '#81C784']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBar,
                  { width: `${item.progress || 0}%` },
                ]}
              />
              </View>
              <Text style={styles.progressText}>
                {item.listWord?.length || 0} vocabs
              </Text>
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

const TopicModal = ({ visible, topic, onClose, navigation }) => {
  const renderButton = (text, colors, onPress) => (
    <TouchableOpacity
      style={styles.learnButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.learnButtonGradient}
      >
        <Text style={styles.learnButtonText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="fade"
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
                  <Text style={styles.modalTitle}>{topic.name}</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <FontAwesome5 name="times" size={22} color="#666" />
                  </TouchableOpacity>
                </View>

                <Image 
                  source={{ uri: topic.thumbnail }} 
                  style={styles.modalImage}
                />

                <Text style={styles.modalDescription}>
                  Learn vocabulary on the topic of{' '}
                  <Text style={styles.emphasisText}>
                    {topic.name || 'No information available'}
                  </Text>{' '}
                  to enhance your vocabulary skills.
                </Text>

                {topic.isLearned ? (
                  <>
                    {renderButton(
                      'REVIEW',
                      ['#4CAF50', '#2E7D32'],
                      () => {
                        onClose();
                        navigation.navigate('VocabTestScreen', { topicId: topic.id }); // Điều hướng sau
                      }
                    )}
                    {renderButton(
                      'CONTINUE LEARNING',
                      ['#FF9800', '#F57C00'],
                      () => {
                        onClose();
                        navigation.navigate('VocabLearnScreen', { topicId: topic.id })
                      } 
                    )}
                    {renderButton(
  'VIEW RESULTS',
  ['#FF5722', '#D84315'],
  () => {
    onClose();
    navigation.navigate('VocabResultScreen', {
      topicId: topic.id,
      topicName: topic.name,
    });
  }
)}
                  </>
                ) : (
                  renderButton(
                    'START LEARNING',
                    ['#4CAF50', '#2E7D32'],
                    () => navigation.navigate('VocabLearnScreen', { topicId: topic.id })
                  )
                )}
              </>
            )}

          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const ReviewSection = ({ review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewerInfo}>
        <View style={styles.avatarContainer}>
          {review.user.avatar ? (
            <Image
              source={{ uri: review.user.avatar }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {review.user.name ? review.user.name[0] : 'U'}
            </Text>
          )}
        </View>
        <Text style={styles.reviewerName} numberOfLines={1}>
          {review.user.name || 'Anonymous'}
        </Text>
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
    <Text style={styles.reviewText} numberOfLines={3}>
      {review.ratingContent}
    </Text>
  </View>
);

const ReviewsContainer = ({ topicId, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}:3001/api/v1/rating/groupTopic/${topicId}`
        );
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [topicId, refreshTrigger]);

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = reviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderItem = ({ item }) => <ReviewSection review={item} />;
  
  const renderSeparator = () => (
    <View style={{ height: 10, backgroundColor: 'transparent' }} />
  );

  const renderHeader = () => (
    <View style={styles.reviewsHeader}>
      <Text style={styles.sectionTitle}>Reviews</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.paginationContainer}>
      <Pagination
        currentPage={currentPage}
        totalItems={reviews.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={paginatedReviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={renderSeparator}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const CommentSection = ({ topicId, onCommentSubmitted }) => {
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    showCancel: false,
  });

  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const inputRef = useRef(null);

  const showAlert = (title, message, type, showCancel = false, onConfirm = () => {}) => {
    setModal({ visible: true, title, message, type, showCancel, onConfirm });
  };

  const handleSubmitComment = async () => {
    if (rating === 0 || message.trim() === '') {
      showAlert('Error', 'Please provide a rating and a comment.', 'error');
      return;
    }
  
    const commentData = {
      rating,
      ratingContent: message,
    };
  
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/rating/groupTopic/${topicId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });
  
      console.log(commentData);
  
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
  
        if (data && (data.success || response.status === 201)) {
          showAlert('Success', 'Comment submitted successfully!', 'success');
          setMessage('');
          setRating(0);
          Keyboard.dismiss();
          onCommentSubmitted();
        } else {
          showAlert('Error', 'Error submitting comment. Please try again.', 'error');
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Error submitting comment.';
        showAlert('Error', errorMessage, 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'An error occurred while submitting the comment.', 'error');
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.commentContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <Text style={styles.sectionTitle}>Your Comment</Text>

      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
            <FontAwesome5
              name="star"
              solid={i < rating}
              size={24}
              color={i < rating ? '#FFD700' : '#E0E0E0'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.commentInputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.commentInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Share your thoughts..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={handleSubmitComment}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSubmitComment}>
          <FontAwesome5 name="paper-plane" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <AlertModal modal={modal} setModal={setModal} />
    </KeyboardAvoidingView>
  );
};

const VocabDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { topicId } = route.params;
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [userDetails, setUserDetails] = useState(null);  // New state for user details
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const [review, setReview] = useState({});
  const [reviews, setReviews] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [stats, setStats] = useState([
  ]);

  const handleCommentSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const addReview = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (topicId) {
        try {  
          const token = await AsyncStorage.getItem('token');
          const userResponse = await fetch(`${API_BASE_URL}:3001/api/v1/group-topic/${topicId}/user`, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
          });

          const userData = await userResponse.json();
          setSelectedTopic(userData);

          const updatedTopics = userData.topics.map((topic) => {
            const totalWords = topic.listWord?.length || 0;
            const retainedWords = topic.retainedWord || 0;
            const progress = totalWords > 0 ? (retainedWords / totalWords) * 100 : 0;
  
            return { ...topic, progress };
          });
  
          setTopics(updatedTopics);

          let learnedLessons = 0;
          let unlearnedLessons = 0;
          let unlearnedWords = 0;
          let totalWords = 0;
          let totalRetainedWords = 0;

          userData.topics.forEach((topic) => {
            if (topic.isLearned) {
              learnedLessons++;
            } else {
              unlearnedLessons++;
            }

            totalRetainedWords += topic.retainedWord;
            totalWords += topic.listWord.length;
          });

          unlearnedWords = totalWords - totalRetainedWords;
          setStats([
            { label: 'Lessons Learned', value: learnedLessons, icon: 'book-open' },
            { label: 'Lessons Unlearned', value: unlearnedLessons, icon: 'book' },
            { label: 'Words Mastered', value: totalRetainedWords, icon: 'check-circle' },
            { label: 'Words Unmastered', value: unlearnedWords, icon: 'circle' },
          ]);          
          setUserDetails(userData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
  
    fetchData();
  }, [topicId]);  

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
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

  const handleSubmitComment = () => {
    if (message.trim()) {
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
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
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

            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Study Progress</Text>
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <StatBox key={index} {...stat} />
                ))}
              </View>
            </View>

            <ReviewsContainer topicId={topicId} refreshTrigger={refreshTrigger} />
            <CommentSection topicId={topicId} onCommentSubmitted={handleCommentSubmitted} />
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

      <TopicModal
        visible={modalVisible}
        topic={selectedTopic}
        onClose={() => setModalVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const AlertModal = ({ modal, setModal }) => (
  <Modal
    transparent
    visible={modal.visible}
    animationType="fade"
    onRequestClose={() => setModal(prev => ({ ...prev, visible: false }))}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={[styles.modalHeader, styles[`${modal.type}Header`]]}>
          <Text style={styles.modalTitle}>{modal.title}</Text>
        </View>
        <View style={styles.modalBody}>
          <Text style={styles.modalMessage}>{modal.message}</Text>
        </View>
        <View style={styles.modalFooter}>
          {modal.showCancel && (
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setModal(prev => ({ ...prev, visible: false }))}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalConfirmButton]}
            onPress={() => {
              setModal(prev => ({ ...prev, visible: false }));
              modal.onConfirm();
            }}
          >
            <Text style={styles.modalButtonText}>
              {modal.type === 'danger' ? 'Logout' : 'OK'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
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
    padding: 20, 
    backgroundColor: '#f9f9f9', 
    borderRadius: 10, 
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: 12, 
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 12, 
    justifyContent: 'center', 
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0', // Light border for separation
    paddingTop: 10, // Padding above the input field
    paddingBottom: 30
  },
  commentInput: {
    flex: 1,
    height: 120, // Increased height for a more comfortable typing area
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8, // Rounded corners for the input
    padding: 12, // Padding for comfort while typing
    fontSize: 16, // Slightly larger font size for easier reading
    backgroundColor: '#fff', // White background to focus on text
    textAlignVertical: 'top', // Ensure text starts at the top of the input
    marginRight: 15,
  },
  sendButton: {
    width: 50, 
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50', 
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50, 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)', // Darker overlay for better contrast
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '95%',
    maxWidth: 500, // Limit maximum width for larger screens
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for close button
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 16,
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 17,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  learnButton: {
    width: '100%',
    marginBottom: 12,
  },
  learnButtonGradient: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  learnButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emphasisText: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalHeaderError: {
    backgroundColor: '#EA4335',
  },
  modalHeaderSuccess: {
    backgroundColor: '#34A853',
  },
  modalHeaderDanger: {
    backgroundColor: '#EA4335',
  },
  modalHeaderWarning: {
    backgroundColor: '#FBBC04',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBody: {
    padding: 24,
    backgroundColor: '#fff',
  },
  modalMessage: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#34A853',
  },
  modalCancelButton: {
    backgroundColor: '#EA4335',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VocabDetailScreen;
