import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 4;

const FolderWordDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const { folder } = route.params || {};

  const handleBeginLearning = () => {
    if (folder?.words && folder.words.length >= 4) {
      navigation.navigate("VocabTestScreen", { topicId: folder.id });
    } else {
      Alert.alert(
        "Not Enough Words",
        "Please add at least 4 words to start your practice journey."
      );
    }
  };

  const paginatedWords = folder?.words?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil((folder?.words?.length || 0) / ITEMS_PER_PAGE);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerCard}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            Enhance Your Vocabulary
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={3}>
            Unlock learning potential by pinning at least 4 words to start your practice journey.
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.startButton} 
          activeOpacity={0.7}
          onPress={handleBeginLearning}
        >
          <Text style={styles.startButtonText}>Begin Learning</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.folderSection}>
        <View style={styles.folderTitleContainer}>
          <Text style={styles.folderTitle} numberOfLines={2} adjustsFontSizeToFit>
            {folder?.name || 'Untitled Folder'}
          </Text>
          <TouchableOpacity 
            style={styles.editButton} 
            activeOpacity={0.7}
          >
            <Feather
              name="edit-2"
              size={22}
              color="#6a11cb"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.folderSubtitle} numberOfLines={3}>
          {folder?.description || 'No description available'}
        </Text>
        <TouchableOpacity 
          style={styles.allFoldersLinkContainer} 
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.allFoldersLink}>View All Folders</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.wordsContainer}>
        <Text style={styles.sectionTitle}>Words in Collection</Text>
        {paginatedWords && paginatedWords.length > 0 ? (
          paginatedWords.map((word, index) => (
            <TouchableOpacity 
              key={word.id || index} 
              style={styles.wordCard}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: word.thumbnail }}
                style={styles.wordImage}
                resizeMode="cover"
              />
              <View style={styles.wordInfo}>
                <Text style={styles.word} numberOfLines={1}>
                  {word.word || 'Unknown'}
                </Text>
                <Text style={styles.pronunciation} numberOfLines={1}>
                  {word.pronunciation || 'No pronunciation'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Feather 
              name="folder-open" 
              size={50} 
              color="#ccc" 
            />
            <Text style={styles.noWordsText}>
              No words in this folder yet. Start adding some!
            </Text>
          </View>
        )}

        {folder?.words?.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalItems={folder.words.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </View>
    </ScrollView>
  );
};


const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Header Section with Gradient
  headerCard: {
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#6a11cb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerTextContainer: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#e0e0ff',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Folder Section
  folderSection: {
    backgroundColor: '#fff',
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  folderTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  folderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  editButton: {
    padding: 8,
  },
  folderSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  allFoldersLinkContainer: {
    alignSelf: 'flex-end',
  },
  allFoldersLink: {
    color: '#6a11cb',
    fontWeight: '600',
    fontSize: 15,
  },
  // Words List
  wordsContainer: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20, // Increased padding
    borderRadius: 15, // Slightly larger radius
    marginBottom: 15, // More spacing between cards
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5, // Slightly larger shadow
    elevation: 3,
  },
  wordImage: {
    width: 70, // Larger image
    height: 70,
    borderRadius: 12,
    marginRight: 18, // Increased spacing
  },
  word: {
    fontSize: 20, // Larger font
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  pronunciation: {
    fontSize: 16,
    color: '#777',
  },  
  // Empty State Styling
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f9f9fe',
    borderRadius: 15,
  },
  noWordsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  addWordsButton: {
    backgroundColor: '#6a11cb',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  addWordsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default FolderWordDetail;