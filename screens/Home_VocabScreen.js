import React, { useEffect, useState } from "react";
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
  StatusBar
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import VocabCard from "../components/Vocab";
import colors from "../constants/colors";

const { width, height } = Dimensions.get('window');

const LEVELS = [
  { id: 'all', label: 'Tất cả', color: '#9E9E9E' },
  { id: 'elementary', label: 'Sơ cấp', color: '#4CAF50' },
  { id: 'intermediate', label: 'Trung cấp', color: '#FF9800' },
  { id: 'advanced', label: 'Cao cấp', color: '#F44336' },
];

const VOCAB_DATA = [
  { id: 1, word: "Basic Word 1", level: 'elementary' },
  { id: 2, word: "Intermediate Word 1", level: 'intermediate' },
  { id: 3, word: "Advanced Word 1", level: 'advanced' },
  { id: 4, word: "Basic Word 2", level: 'elementary' },
  { id: 5, word: "Intermediate Word 2", level: 'intermediate' },
  { id: 6, word: "Advanced Word 2", level: 'advanced' },
];

const HomeVocabScreen = () => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchDataFromToken();
  }, []);

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

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUsername(data.name || 'User');
      }
    } catch (error) {
      console.error('Error fetching user data from API:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Vocabulary</Text>
        <TouchableOpacity style={styles.profileButton}>
          <MaterialIcons name="person" size={24} color="white" />
          <Text style={styles.profileText}>{username}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Tìm kiếm bộ từ vựng..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.levelContainer}
      >
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelButton,
              selectedLevel === level.id && { backgroundColor: level.color }
            ]}
            onPress={() => setSelectedLevel(level.id)}
          >
            <Text style={[
              styles.levelText,
              selectedLevel === level.id && styles.levelTextSelected
            ]}>
              {level.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Filter vocabulary data based on selected level and search text
  const filteredVocabData = VOCAB_DATA.filter(vocab =>
    (selectedLevel === 'all' || vocab.level === selectedLevel) &&
    vocab.word.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Bộ từ vựng</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>324</Text>
            <Text style={styles.statLabel}>Từ đã học</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Độ chính xác</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Các bộ từ vựng</Text>
        
        {filteredVocabData.map((vocab) => (
          <VocabCard key={vocab.id} word={vocab.word} level={vocab.level} />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  headerTitle: {
    color: 'white',
    fontSize: width * 0.06,
    fontWeight: 'bold',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileText: {
    color: 'white',
    marginLeft: 8,
    fontSize: width * 0.04,
  },
  searchContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: width * 0.04,
    color: '#333',
  },
  levelContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
  },
  levelButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  levelText: {
    color: 'white',
    fontSize: width * 0.04,
    fontWeight: '500',
  },
  levelTextSelected: {
    fontWeight: 'bold',
  },
  scrollContainer: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: height * 0.02,
    paddingHorizontal: width * 0.05,
    minHeight: height - 200,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: width * 0.035,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEE',
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
});

export default HomeVocabScreen;
