import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import Pagination from '../components/Pagination';

const TestScreen = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);   

  const handleTagPress = (tag) => {
    if (selectedTag?.id === tag.id) {
      setSelectedTag(null);
      setSearchText('');
    } else {
      setSelectedTag(tag);
      setSearchText(tag.name);
    }
  };

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test`, {
        params: {
          search: searchText || '',
        }
      });

      const sortedTests = response.data?.data?.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ) || [];
      
      setTests(sortedTests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    fetchTests();
    fetchTags();
  }, [fetchTests, fetchTags]);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/tag?type=test_type`);
      console.log(response);
      if (response.status === 200) {
        const tags = response.data;
        setTags(tags);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestPress = (test) => {
    navigation.navigate('TestSubject', { id: test.id, test });
  };   

  const renderTestItem = (test) => {
    const totalQuestions = test.groupQuestions?.reduce((total, group) => 
      total + (group.questions?.length || 0), 0) || 0;
    
    const getDifficultyLabel = () => {
      if (totalQuestions <= 20) return 'Mini Test';
      if (totalQuestions <= 50) return 'Standard Test';
      return 'Comprehensive Test';
    };

    return (
      <TouchableOpacity 
        key={test.id}
        style={styles.testCard} 
        onPress={() => handleTestPress(test)}
      >
        <View style={styles.testCardHeader}>
          <View style={styles.testIconContainer}>
            <Feather name="book-open" size={24} color="#007AFF" />
          </View>
          <View style={styles.testDetails}>
            <Text style={styles.testTitle} numberOfLines={2}>
              {test.name}
            </Text>
            <View style={styles.testMetadata}>
              <View style={styles.metadataChip}>
                <Feather name="clock" size={14} color="#666" />
                <Text style={styles.metadataText}>{test.time} mins</Text>
              </View>
              <View style={styles.metadataChip}>
                <Feather name="list" size={14} color="#666" />
                <Text style={styles.metadataText}>{totalQuestions} Questions</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.testCardFooter}>
          <Text style={styles.testDate}>
            Added: {new Date(test.createdAt).toLocaleDateString()}
          </Text>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTags = () => {
    if (tags.length === 0) {
      return null;
    }
  
    return (
      <View style={styles.tagContainer}>
        <Text style={styles.tagSectionTitle}>Filter by Category:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tagList}
        >
          {tags.map((tag) => {
            const isSelected = selectedTag?.id === tag.id;
            return (
              <TouchableOpacity 
                key={tag.id} 
                style={[
                  styles.tagChip,
                  isSelected && styles.tagChipSelected
                ]}
                onPress={() => handleTagPress(tag)}
              >
                <Feather 
                  name={isSelected ? "check-circle" : "tag"} 
                  size={14} 
                  color={isSelected ? "#FFFFFF" : "#007AFF"} 
                  style={styles.tagIcon}
                />
                <Text style={[
                  styles.tagText,
                  isSelected && styles.tagTextSelected
                ]}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading TOEIC Tests...</Text>
        </View>
      );
    }
  
    const filteredTests = tests.filter(test => 
      test.name.toLowerCase().includes(searchText.toLowerCase())
    );
  
    const totalFilteredTests = filteredTests.length;
    const totalPages = Math.ceil(totalFilteredTests / ITEMS_PER_PAGE);
    const paginatedTests = filteredTests.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  
    if (totalFilteredTests === 0) {
      return (
        <View style={styles.centerContent}>
          <Feather name="frown" size={50} color="#666" />
          <Text style={styles.emptyStateTitle}>No Tests Found</Text>
          <Text style={styles.emptyStateSubtitle}>Try a different search term</Text>
        </View>
      );
    }
  
    return (
      <ScrollView 
        contentContainerStyle={[styles.testList, { paddingBottom: 100 }]} 
        showsVerticalScrollIndicator={false}
      >
        {renderTags()}
        {paginatedTests.map(renderTestItem)}
        <View style={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            totalItems={totalFilteredTests}
            itemsPerPage={ITEMS_PER_PAGE}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </View>
      </ScrollView>
    );
  };  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TOEIC Exam Library</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="bell" size={22} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="info" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search practice tests..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Feather name="x-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  testList: {
    paddingVertical: 16,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testDetails: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  testMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  testCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  testDate: {
    fontSize: 12,
    color: '#999',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  paginationContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  tagList: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  tagChip: {
    backgroundColor: '#E6F2FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  tagContainer: {
    marginBottom: 16,
  },
  tagSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
    marginBottom: 8,
  },
  tagList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E6F2FF',
  },
  tagChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
});

export default TestScreen;