import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated
} from "react-native";
import { MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../constants/colors";
import Pagination from "../components/Pagination";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LEVELS = [
  { id: 'all', label: 'All', color: '#9E9E9E', icon: 'layers', gradient: ['#9E9E9E', '#757575'] },
  { id: 'beginner', label: 'Beginner', color: '#4CAF50', icon: 'smile', gradient: ['#4CAF50', '#388E3C'] },
  { id: 'intermediate', label: 'Intermediate', color: '#FF9800', icon: 'trending-up', gradient: ['#FF9800', '#F57C00'] },
  { id: 'advanced', label: 'Advanced', color: '#F44336', icon: 'star', gradient: ['#F44336', '#D32F2F'] },
];

const ITEMS_PER_PAGE = 4;

const HomeVocabScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [username, setUsername] = useState('');
  const [vocabGroups, setVocabGroups] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    };
  
    animate();
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    try {
      await Promise.all([fetchDataFromToken(), fetchVocabGroups()]);
    } catch (error) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDataFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch('http://10.0.2.2:3000/api/v1/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUsername(data.name || 'User');
      }
    } catch (error) {
      setError('Unable to load user data');
    }
  };
  

  const fetchVocabGroups = async () => {
    try {
        const response = await fetch('http://10.0.2.2:3000/api/v1/group-topic/');
        if (!response.ok) throw new Error('Failed to fetch vocab groups');
        
        const data = await response.json();

        // Ensure all groups have `__topics__` and `topicsCount`
        const processedData = data.map(group => ({
            ...group,
            __topics__: group.__topics__ || [],
            topicsCount: group.__topics__ ? group.__topics__.length : 0,
        }));

        setVocabGroups(processedData);
        await AsyncStorage.setItem('vocabGroups', JSON.stringify(processedData));
        await AsyncStorage.setItem('lastUpdated', Date.now().toString());
    } catch (error) {
        setError('Unable to load vocabulary groups');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  }, []);

  const renderWelcomeHeader = () => (
    <LinearGradient colors={[colors.primary, `${colors.primary}E6`]} style={styles.headerGradient}>
      <View style={styles.headerTop}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{username}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
          <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={styles.profileGradient}>
            <MaterialIcons name="person" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderSearchBar = () => (
    <View style={styles.searchWrapper}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Find your vocabulary sets..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );

  const renderLevelFilters = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelContainer}>
      {LEVELS.map((level) => (
        <TouchableOpacity
          key={level.id}
          style={[styles.levelButton, selectedLevel === level.id && styles.levelButtonSelected]}
          onPress={() => {
            setSelectedLevel(level.id);
            setCurrentPage(1);
          }}
        >
          <LinearGradient
            colors={selectedLevel === level.id ? level.gradient : ['transparent', 'transparent']}
            style={styles.levelButtonGradient}
          >
            <Feather name={level.icon} size={18} color={selectedLevel === level.id ? 'white' : level.color} />
            <Text style={[styles.levelText, selectedLevel === level.id && styles.levelTextSelected]}>
              {level.label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderVocabCard = (group) => {
    return (
      <Animated.View key={group.id} style={[styles.vocabCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity style={styles.vocabCardInner} onPress={() => navigation.navigate('VocabDetailScreen', { topicId: group.id })}>
          <Image source={{ uri: group.thumbnail }} style={styles.thumbnail} defaultSource={require('../assets/placeholder.png')} />
          <View style={styles.vocabInfo}>
            <Text style={styles.vocabName} numberOfLines={1}>{group.name}</Text>
            <View style={styles.vocabMeta}>
              <LinearGradient
                colors={LEVELS.find((l) => l.id === group.level)?.gradient || ['#9E9E9E', '#757575']}
                style={styles.levelTag}
              >
                <Text style={styles.levelTagText}>{group.level}</Text>
              </LinearGradient>
              <View style={styles.wordCountContainer}>
                <Feather name="book" size={14} color="#666" />
                <Text style={styles.wordCount}>{group.topicsCount} topics</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${group.progress || 0}%` }]} />
              </View>
              <Text style={styles.progressText}>{`${group.progress || 0}% Complete`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your vocabulary sets...</Text>
      </View>
    );
  }

  const filteredVocabGroups = vocabGroups
    .filter((group) => (selectedLevel === 'all' ? true : group.level === selectedLevel))
    .filter((group) => group.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        {renderWelcomeHeader()}
  
        <View style={styles.mainContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          >
            {renderSearchBar()}
            {renderLevelFilters()}
  
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={48} color="#666" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchInitialData}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Vocabulary Sets</Text>
                  <Text style={styles.sectionCount}>{filteredVocabGroups.length} sets</Text>
                </View>
  
                {filteredVocabGroups.length > 0 ? (
                  <View style={styles.vocabList}>
                    {filteredVocabGroups
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map(renderVocabCard)}
                  </View>
                ) : (
                  <Text style={styles.noResultsText}>No vocabulary sets found.</Text>
                )}
  
                <View style={styles.paginationContainer}>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredVocabGroups.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    paddingBottom: 50, // Increased to accommodate the search bar overlap
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  
  welcomeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  headerSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  
  profileGradient: {
    padding: 12,
    borderRadius: 20,
  },
  
  // Update search wrapper to overlap with header
  searchWrapper: {
    marginTop: -4, // Increased negative margin to overlap more with header
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  levelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 16,
  },
  levelButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  levelButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  levelText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  levelTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContainer: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    minHeight: height - 200,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
  },
  vocabCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  vocabCardInner: {
    padding: 16,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  vocabInfo: {
    flex: 1,
  },
  vocabName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  vocabMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  levelTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordCount: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    marginTop: -20, // Pull content up
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  scrollContainer: {
    paddingTop: 16,
    paddingBottom: 16, // Reduced bottom padding
  },

  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    paddingBottom: 40, // Reduced padding to pull content up
  },

  searchWrapper: {
    marginTop: -4, // Pull search bar up more
    paddingHorizontal: 20,
    marginBottom: 12, // Reduced margin
  },

  levelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4, // Reduced padding
    marginBottom: 12, // Reduced margin
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 12, // Reduced margin
  },

  vocabList: {
    paddingHorizontal: 20,
  },

  vocabCard: {
    marginBottom: 12, // Reduced margin
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  paginationContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
});

export default HomeVocabScreen;
