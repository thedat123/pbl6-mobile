import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { API_BASE_URL } from '@env';
import Pagination from '../components/Pagination';

const LEVELS = {
  beginner: { color: '#22c55e', icon: 'smile', gradient: ['#22c55e', '#15803d'] },
  intermediate: { color: '#3b82f6', icon: 'target', gradient: ['#3b82f6', '#1d4ed8'] },
  advanced: { color: '#f97316', icon: 'award', gradient: ['#f97316', '#ea580c'] }
};

const ITEMS_PER_PAGE = 4;

const ListenTest = () => {
    const [activeLevel, setActiveLevel] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTestId, setExpandedTestId] = useState(null);
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, []);

    const handleSearch = (text) => {
      setSearchQuery(text);
      setExpandedTestId(null);
      setCurrentPage(1);
    };

    const handleLevelChange = (level) => {
      setActiveLevel(level);
      setExpandedTestId(null);
      setCurrentPage(1);
    };

    const filteredTests = tests.filter(test => {
      const matchesLevel = activeLevel === 'all' || test.level === activeLevel;
      const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTests = filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const TestCard = ({ test }) => {
      const isExpanded = expandedTestId === test.id;
      const levelConfig = LEVELS[test.level] || { color: '#gray', icon: 'book', gradient: ['#gray', '#darkgray'] };
      const [scaleAnim] = useState(new Animated.Value(1));

      const handlePress = () => {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        ]).start();
        setExpandedTestId(isExpanded ? null : test.id);
      };

      return (
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity 
            style={[styles.card, isExpanded && styles.expandedCard]}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.levelIcon, { backgroundColor: levelConfig.color }]}>
                <Icon name={levelConfig.icon} size={24} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.testName}>{test.name}</Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.levelBadge, { backgroundColor: levelConfig.color }]}>
                    {test.level}
                  </Text>
                  <View style={styles.lessonCountContainer}>
                    <Icon name="book-open" size={14} color="#6b7280" />
                    <Text style={styles.lessonCount}>
                      {test.listenLessons.length} Lesson{test.listenLessons.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
              <Icon 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#9ca3af" 
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.lessonList}>
              {test.listenLessons.length > 0 ? (
                test.listenLessons.map(lesson => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.lessonItem}
                    onPress={() => navigation.navigate("ListenTestPractice", { testId: test.id })}
                  >
                    <Icon name="play-circle" size={20} color={levelConfig.color} />
                    <Text style={styles.lessonName}>{lesson.name}</Text>
                    <Icon name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="inbox" size={24} color="#9ca3af" />
                  <Text style={styles.emptyMessage}>No lessons available yet</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      );
    };

    useEffect(() => {
      const fetchTests = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}:3001/api/v1/listen-group`);
          const { data } = await response.json();
          setTests(data);
        } catch (error) {
          console.error('Failed to fetch tests:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTests();
    }, []);

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      );
    }

    return (
      <Animated.ScrollView 
        style={[styles.container, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>Listen Library</Text>

        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lessons..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="x" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.levelFilter}
          contentContainerStyle={styles.levelFilterContent}
        >
          {['all', ...Object.keys(LEVELS)].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                activeLevel === level && styles.activeLevelButton,
                activeLevel === level && { backgroundColor: LEVELS[level]?.color || '#2563eb' }
              ]}
              onPress={() => handleLevelChange(level)}
            >
              {level !== 'all' && (
                <Icon 
                  name={LEVELS[level].icon} 
                  size={16} 
                  color={activeLevel === level ? '#fff' : '#6b7280'} 
                  style={styles.levelButtonIcon}
                />
              )}
              <Text style={[
                styles.levelButtonText,
                activeLevel === level && styles.activeLevelText
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.testList}>
          {currentTests.length > 0 ? (
            currentTests.map(test => <TestCard key={test.id} test={test} />)
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="search" size={48} color="#9ca3af" />
              <Text style={styles.noResultsText}>No lessons found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search or filters</Text>
            </View>
          )}

          {filteredTests.length > ITEMS_PER_PAGE && (
            <View style={styles.paginationContainer}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredTests.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </View>
          )}
        </View>
      </Animated.ScrollView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: Platform.OS === 'ios' ? 48 : 16,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  levelFilter: {
    marginBottom: 24,
  },
  levelFilterContent: {
    paddingRight: 8,
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  levelButtonIcon: {
    marginRight: 6,
  },
  levelButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  activeLevelButton: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  activeLevelText: {
    color: '#fff',
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandedCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  lessonCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonCount: {
    marginLeft: 6,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  lessonList: {
    backgroundColor: '#f9fafb',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  lessonName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyMessage: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  noResultsContainer: {
    padding: 48,
    alignItems: 'center',
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  noResultsSubtext: {
    marginTop: 8,
    fontSize: 15,
    color: '#6b7280',
  },
  paginationContainer: {
    flex: 1
  },
  testList: {
    marginBottom: 24,
  },
  expandedLessonText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#9ca3af',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  levelIconShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ListenTest;