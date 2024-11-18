import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const FilterButton = ({ title, isActive, onPress, icon }) => {
  const scale = useState(new Animated.Value(1))[0];

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive, { transform: [{ scale }] }]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <FontAwesome name={icon} size={18} color={isActive ? '#fff' : '#666'} style={styles.filterIcon} />
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </AnimatedTouchableOpacity>
  );
};

const TestCard = ({ title, testsCount, progress = 0, onPress }) => {
  const scale = useState(new Animated.Value(1))[0];

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity style={[styles.testCard, { transform: [{ scale }] }]} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <View style={styles.testInfo}>
        <View style={styles.testIconContainer}>
          <FontAwesome name="file-text-o" size={20} color="#007AFF" />
        </View>
        <Text style={styles.testTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.testStats}>
        <View style={styles.statsContainer}>
          <FontAwesome name="clock-o" size={14} color="#666" style={styles.statsIcon} />
          <Text style={styles.testCount}>{testsCount} tests</Text>
          <View style={styles.testDuration}>
            <FontAwesome name="hourglass-half" size={12} color="#666" />
            <Text style={styles.durationText}>120 min</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.percentage}>{progress}%</Text>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const TestSection = ({ title, imageSource, onTestPress, filter }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Image source={imageSource} style={styles.sectionImage} />
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>6 practice tests available</Text>
      </View>
      <TouchableOpacity style={styles.seeAllButton}>
        <Text style={styles.seeAllText}>See all</Text>
        <FontAwesome name="angle-right" size={16} color="#007AFF" />
      </TouchableOpacity>
    </View>
    <View style={styles.testGrid}>
      {[1, 2, 3, 4, 5, 6].map((num) => {
        // Filter logic based on activeFilter
        if (filter && !title.toLowerCase().includes(filter.toLowerCase())) {
          return null;
        }
        return (
          <TestCard
            key={num}
            title={`2024 Practice Set TOEIC Test ${num}`}
            testsCount={3}
            progress={num * 10}
            onPress={() => onTestPress(num)}
          />
        );
      })}
    </View>
  </View>
);

const TestScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All Skills');
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  const handleTestPress = useCallback(() => {
    navigation.navigate('TestSubject');
  }, []);

  // Define test sections with categories (Listening, Reading, etc.)
  const testSections = [
    { title: '2024 Practice Set 1', category: 'Listening' },
    { title: '2024 Practice Set 2', category: 'Reading' },
    { title: '2024 Practice Set 3', category: 'Listening' },
    { title: '2024 Practice Set 4', category: 'Reading' },
    { title: '2024 Practice Set 5', category: 'Listening' },
    { title: '2024 Practice Set 6', category: 'Reading' },
  ];

  // Combine the search text and active filter to filter sections
  const filteredSections = testSections.filter((section) => {
    return (
      section.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (activeFilter === 'All Skills' || section.category === activeFilter)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TOEIC EXAM LIBRARY</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <FontAwesome name="bell-o" size={22} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <FontAwesome name="info-circle" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for tests..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText('')}>
              <FontAwesome name="times-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterButtons}>
          <FilterButton
            title="All Skills"
            icon="bars"
            isActive={activeFilter === 'All Skills'}
            onPress={() => setActiveFilter('All Skills')}
          />
          <FilterButton
            title="Listening"
            icon="headphones"
            isActive={activeFilter === 'Listening'}
            onPress={() => setActiveFilter('Listening')}
          />
          <FilterButton
            title="Reading"
            icon="book"
            isActive={activeFilter === 'Reading'}
            onPress={() => setActiveFilter('Reading')}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredSections.map((section, index) => (
          <TestSection
            key={index}
            title={section.title}
            imageSource={{ uri: 'http://192.168.100.101:8081/assets/images/Test/toeic_test_home.png' }}
            filter={searchText}  // Pass the active search text as a filter to TestSection
            onTestPress={handleTestPress}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 12,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  testCard: {
    width: '50%',
    padding: 8,
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 12,
  },
  testIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  testStats: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsIcon: {
    marginRight: 6,
  },
  testCount: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  testDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  durationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  percentage: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    minWidth: 32,
  },
});

export default TestScreen;