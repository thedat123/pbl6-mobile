import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder, TouchableWithoutFeedback, ScrollView, Modal, TextInput, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import WordContent from '../components/WordContent';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const VocabLearnScreen = ({ route }) => {
  const { topicId } = route.params;
  const navigation = useNavigation();

  const [vocabList, setVocabList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentView, setCurrentView] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [folders, setFolders] = useState([{ name: 'Example Folder', description: '', wordCount: 0 }]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const [isCreateFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [typedWord, setTypedWord] = useState('');
  const tickSound = useRef({ sound: null });
  const [isIncorrect, setIsIncorrect] = useState(false);

  const [editingFolder, setEditingFolder] = useState(null);
  const [editedFolderName, setEditedFolderName] = useState('');

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const showAlert = (title, message, type, showCancel = false, onConfirm = () => {}) => {
    setModal({ visible: true, title, message, type, showCancel, onConfirm });
  };

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);   

  useEffect(() => {
    if (topicId) {
      fetchVocabularyData();
    }
  }, [topicId]);

  const fetchVocabularyData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/topic/${topicId}`);
      const data = await response.json();
      const words = data.listWord || [];
      setVocabList(words);
      setProgress(1 / words.length);
    } catch (error) {
      console.error('Error fetching vocabulary data:', error);
    }
  };

  const [modal, setModal] = useState({
      visible: false,
      title: '',
      message: '',
      type: 'info',
      onConfirm: () => {},
      showCancel: false,
  });

  const handleSubmitWord = async () => {
    const isCorrect = typedWord.trim().toLowerCase() === vocabList[currentIndex]?.word.toLowerCase();

    const soundFile = isCorrect
      ? require('../assets/audio/right_answer.mp3')
      : require('../assets/audio/wrong_answer.mp3');
    
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
      tickSound.current = sound;
  
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
        }
      });
  
      if (isCorrect) {
        setIsIncorrect(false);
        const audioUri = vocabList[currentIndex]?.audio;
        await handleSpeak(audioUri);
        setCurrentView(2);
      } else {
        setIsIncorrect(true);
      }

    } catch (error) {
      console.error('Error playing sound:', error);
    }
  
    setTypedWord(''); 
  };  
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = 50; 
        if (gestureState.dx < -swipeThreshold) {
          handleNextWord(); 
        } else if (gestureState.dx > swipeThreshold) {
          handlePreviousWord(); 
        }
      },
    })
  ).current;  

  const handleRotate = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      rotateAnim.setValue(0);
      setCurrentView((prevView) => (prevView + 1) % 3);
    });
  };

  const handleNextWord = () => {
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        setProgress((newIndex + 1) / vocabList.length);
        return newIndex;
      });
    } else {
      navigation.navigate('VocabWaitScreen', { topicId: topicId });
    }
  };
  
  const handlePreviousWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex - 1;
        setProgress((newIndex + 1) / vocabList.length);
        return newIndex;
      });
    }
  };  

  const handleSpeak = async (audioUri) => {
    if (audioUri) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        tickSound.current = sound;
  
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
          }
        });
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };
  
  const handleSpeakExample = async (exampleAudioUri) => {
    if (exampleAudioUri) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: exampleAudioUri },
          { shouldPlay: true }
        );
        tickSound.current = sound;
  
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync().catch((err) => console.error("Error unloading sound:", err));
          }
        });
      } catch (error) {
        console.error('Error playing example audio:', error);
      }
    }
  };
  

  const togglePinModal = async () => {
    if (!isPinModalVisible) {
      await loadFolderData();
    }
    setPinModalVisible(!isPinModalVisible);
  };

  const handleDeleteFolder = async (folderId) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }
  
      setFolders(folders.filter(folder => folder.id !== folderId));
      showAlert('Success', 'Folder deleted successfully', 'success');
    } catch (error) {
      showAlert('Error', 'Failed to delete folder. Please try again.', 'error');
    }
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setEditedFolderName(folder.name);
  };  

  const handleSaveFolderName = async () => {
    if (editedFolderName.trim() && editingFolder) {
      const updatedFolder = { ...editingFolder, name: editedFolderName };
  
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic/${editingFolder.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFolder),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update folder');
        }
  
        setFolders((prevFolders) => 
          prevFolders.map((folder) =>
            folder.id === editingFolder.id ? updatedFolder : folder
          )
        );
  
        setEditingFolder(null);
        showAlert('Success', 'Folder updated successfully', 'success');
      } catch (error) {
        showAlert('Error', 'Failed to update folder. Please try again.', 'error');
      }
    } else {
      showAlert('Error', 'Please enter a valid folder name.', 'error');
    }
  };  

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      const newFolder = {
        name: newFolderName,
        description: newFolderDescription,
      };
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newFolder),
        });
  
        if (!response.ok) {
          throw new Error('Failed to create folder.');
        }
  
        const data = await response.json();
        setFolders([
          ...folders,
          { name: newFolderName, description: newFolderDescription, wordCount: 0 },
        ]);
        setNewFolderName('');
        setNewFolderDescription('');
        setCreateFolderModalVisible(false);
      } catch (error) {
        console.error('Error creating folder:', error.message);
        showAlert('Error', 'Failed to create folder. Please try again.', 'error');
      }
    } else {
      showAlert('Error', 'Please enter a folder name.', 'error');
    }
  };

  const loadFolderData = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch folder data');
      }
  
      const data = await response.json();
      const updatedFolders = data.map(folder => ({
        ...folder,
        wordCount: folder.words.length,
      }));
  
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error fetching folder data:', error.message);
      showAlert('Error', 'Unable to load folders. Please try again.', 'error');
    }
  };
  
  const handlePinWord = async () => {
    if (selectedFolder && vocabList[currentIndex]) {
      const folderId = selectedFolder.id;
      const wordId = vocabList[currentIndex].id;
  
      const token = await AsyncStorage.getItem('token');
  
      try {
        const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic/${folderId}/word/${wordId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error();
        }
  
        const data = await response.json();
        showAlert('Success', 'Word pinned successfully!', 'success');
        togglePinModal();
      } catch {
        showAlert('Error', 'Failed to pin word. Please try again.', 'error');
      }
    } else {
      showAlert('Error', 'Please select a folder and a valid word.', 'error');
    }
  };

  const AlertModal = () => (
    <Modal
      transparent
      visible={modal.visible}
      animationType="fade"
      onRequestClose={() => setModal(prev => ({ ...prev, visible: false }))}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentAlert}>
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
    

  if (vocabList.length === 0) {
    return <Text>Loading...</Text>;
  }

  return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{`${currentIndex + 1}/${vocabList.length}`}</Text>
            <ProgressBar progress={progress} />
          </View>
  
          <View {...panResponder.panHandlers}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.cardContainer, { transform: [{ rotateY: rotateInterpolation }] }]}>
                <LinearGradient colors={['#ffffff', '#e0f2f1']} style={styles.card}>
                  <ScrollView style={styles.scrollView}>
                    <WordContent
                      word={vocabList[currentIndex]}
                      currentView={currentView}
                      handleSpeak={handleSpeak}
                      handleSpeakExample={handleSpeakExample}
                    />
                  </ScrollView>
                  <TouchableOpacity style={styles.rotateButton} onPress={handleRotate}>
                    <Icon name="refresh" size={28} color="#2C3E82" />
                    <Text style={styles.rotateText}>Rotate</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
  
          <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              isIncorrect ? styles.textInputIncorrect : null,
            ]}
            placeholder="Type the word..."
            value={typedWord}
            onChangeText={(text) => {
              setTypedWord(text);
              setIsIncorrect(false); // Reset on new input
            }}
          />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitWord}>
              <Text style={styles.submitButtonText}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
  
          <View style={styles.navigation}>
            <TouchableOpacity style={styles.navButton} onPress={handlePreviousWord}>
              <Icon name="chevron-left" size={36} color={currentIndex === 0 ? '#ddd' : '#2C3E82'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.pinButton} onPress={togglePinModal}>
              <Icon name="push-pin" size={36} color="#2C3E82" />
              <Text style={styles.pinText}>Pin Word</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={handleNextWord}>
              <Icon name="chevron-right" size={36} color="#2C3E82" />
            </TouchableOpacity>
          </View>
        </View>
  
        <Modal
          visible={isPinModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPinModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setPinModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setPinModalVisible(false)}
                  >
                    <Icon name="close" size={24} color="#2C3E82" />
                  </TouchableOpacity>

                  <Text style={styles.modalTitle}>Pin Word to Folder</Text>

                  <ScrollView style={styles.folderList}>
                    {folders.map((folder, index) => (
                      <View
                        key={index}
                        style={[
                          styles.folderRow,
                          selectedFolder?.name === folder.name && styles.selectedFolder,
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.folderItem}
                          onPress={() => setSelectedFolder(folder)}
                        >
                          <Text style={styles.folderName}>{folder.name}</Text>
                          <Text style={styles.folderWordCount}>
                            {`${folder.wordCount} words`}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleEditFolder(folder)}
                        >
                          <Icon name="edit" size={20} color="#0000FF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteFolder(folder.id)}
                        >
                          <Icon name="delete" size={20} color="#FF0000" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.newFolderButton}
                    onPress={() => setCreateFolderModalVisible(true)}
                  >
                    <Icon name="add" size={24} color="#2C3E82" />
                    <Text style={styles.newFolderText}>Create New Folder</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.pinConfirmButton} 
                    onPress={handlePinWord}
                  >
                    <Text style={styles.pinConfirmText}>Pin Word</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
  
        <Modal visible={isCreateFolderModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={[styles.closeButton, { zIndex: 10 }]}
                activeOpacity={0.8}
                onPress={() => setCreateFolderModalVisible(false)}
              >
                <Icon name="close" size={24} color="#2C3E82" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Create New Folder</Text>
              <TextInput
                style={styles.input}
                placeholder="Folder Name"
                value={newFolderName}
                onChangeText={setNewFolderName}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={newFolderDescription}
                onChangeText={setNewFolderDescription}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateFolder}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={editingFolder !== null} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={[styles.closeButton, { zIndex: 10 }]}
                activeOpacity={0.8}
                onPress={() => setEditingFolder(null)} // Close the modal
              >
                <Icon name="close" size={24} color="#2C3E82" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Edit Folder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Folder Name"
                value={editedFolderName}
                onChangeText={setEditedFolderName}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveFolderName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <AlertModal />
      </ScrollView>
  );  
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E82', 
    letterSpacing: 0.5,
  },
  cardContainer: {
    width: 400,
    marginBottom: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center', // Centers the card horizontally
    shadowColor: '#2C3E82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    width: '90%',
    padding: 20, // Slightly less padding
    borderRadius: 15, // Softer corners
    backgroundColor: 'rgb(240, 240, 255)', // Match the screen background
    minHeight: 400, // Slightly shorter
    justifyContent: 'center',
    alignItems: 'center', // Ensures content inside the card is centered
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 130, 0.1)',
  },  
  rotateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 62, 130, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 130, 0.1)',
  },
  rotateText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#2C3E82',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 15
  },
  navButton: {
    padding: 8,
    backgroundColor: 'rgba(44, 62, 130, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 130, 0.1)',
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 130, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 130, 0.1)',
  },
  pinText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2C3E82',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 130, 0.3)', // Softer border
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    fontSize: 15,
    backgroundColor: 'white',
    shadowColor: '#2C3E82',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {     
    backgroundColor: '#2C3E82',     
    padding: 12,     
    borderRadius: 12,     
    alignItems: 'center',   
  },
  saveButtonText: {     
    color: 'rgb(240, 240, 255)',     
    fontWeight: '600',   
  },
  submitButton: {
    backgroundColor: '#2C3E82',
    paddingVertical: 10,  
    paddingHorizontal: 20, 
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C3E82',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    height: 60, 
    flexDirection: 'row',
  }, 
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',  // Ensure the text is horizontally centered
  },  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  modalContent: {
    width: '90%', // Slightly wider for better readability
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Increased border radius for softer look
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20, // Slightly larger title
    fontWeight: 'bold',
    color: '#2C3E82',
    marginBottom: 20,
    textAlign: 'center',
  },
  folderList: {
    maxHeight: 300, // Limit height to make scrolling more obvious
  },
  input: {     
    borderWidth: 1,     
    borderColor: '#2C3E82',     
    borderRadius: 10,     
    padding: 10,     
    marginBottom: 10,   
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    backgroundColor: '#F7F9FC', // Soft background for each row
    borderRadius: 12,
    padding: 15,
  },
  folderItem: {
    flex: 1,
  },
  selectedFolder: {
    backgroundColor: 'rgba(44, 62, 130, 0.1)',
  },
  folderName: {
    fontSize: 16,
    color: '#2C3E82',
    fontWeight: '600',
  },
  folderWordCount: {
    fontSize: 14,
    color: '#7A8BA7',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  newFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0F4F8', // Softer background
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 130, 0.1)',
  },
  newFolderText: {
    marginLeft: 10,
    color: '#2C3E82',
    fontWeight: '600',
    fontSize: 16,
  },
  pinConfirmButton: {
    backgroundColor: '#2C3E82',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#2C3E82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  pinConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textInputIncorrect: {
    borderColor: 'red',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContentAlert: {
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


export default VocabLearnScreen;