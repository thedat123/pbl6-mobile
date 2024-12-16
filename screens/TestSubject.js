import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import PracticeMode from '../components/PracticeMode';
import TestSubjectHeader from '../components/TestSubjectHeader';
import FullMode from '../components/FullMode';
import Comment from '../components/Comment';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const TestSubject = () => {
  const route = useRoute();
  const { id, test } = route.params; 
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('Practice');
  const [showAllResults, setShowAllResults] = useState(false);
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []); 

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.warn('No token found');
          return;
        }
  
        const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${id}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        console.log('API Response:', response.data); 
        setTestData(response.data);
      } catch (error) {
        console.error('Failed to fetch test results:', error);
      }
    };
  
    fetchTestResults();
  }, [id]);  

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'Practice':
        return <PracticeMode test={test} id={id} />;
      case 'Full Test':
        return <FullMode test={test} id={id} />;
      case 'Discussion':
        return <Comment idTest={id} />;
      default:
        return null;
    }
  };

  const renderResults = () => {
    const testResults = testData?.testPractice || [];
  
    if (testResults.length === 0) {
      return null; // Return nothing if there are no test results
    }
  
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Your Test Results:</Text>
  
        <ScrollView style={styles.resultsScrollView}>
          {testResults.map((result, index) => (
            <View key={result.id || index} style={styles.tableRow}>
              <View style={styles.dateCell}>
                <Text>{new Date(result.createdAt).toLocaleDateString()}</Text>
                <View style={styles.tagContainer}>
                  <Text style={styles.tagText}>
                    {result.isFullTest ? 'Full Test' : 'Practice'}
                  </Text>
                </View>
              </View>
  
              <Text style={styles.cell}>
                {result.numCorrect ?? 0}/{result.totalQuestion ?? 0}
              </Text>
  
              <Text style={styles.cell}>
                {`${Math.floor((result.time ?? 0) / 60)}:${(result.time ?? 0) % 60}`}
              </Text>
  
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => {
                  navigation.navigate('TestDetailResult', {
                    result,
                  });
                }}
              >
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['Practice', 'Full Test', 'Discussion'].map((tab) => (
        <TouchableOpacity 
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)} 
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TestSubjectHeader 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        test={test} 
      />
      {renderTabs()}

      {/* Display "View Results" button initially if there are test results */}
      {testData?.testPractice?.length > 0 && !showAllResults && (
        <TouchableOpacity
          style={styles.showResultsButton} // Button styling
          onPress={() => setShowAllResults(true)} // Toggle the state to show results
        >
          <Text style={styles.showResultsButtonText}>View Results</Text>
        </TouchableOpacity>
      )}

      {/* Render results only if showAllResults is true */}
      {showAllResults && renderResults()}

      {/* If results are visible, show the Collapse button */}
      {showAllResults && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAllResults(false)} // Collapse results
        >
          <Text style={styles.showMoreText}>Collapse</Text>
        </TouchableOpacity>
      )}

      {renderActiveComponent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateCell: {
    flex: 1.5,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#334155',
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tagText: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    marginRight: 4,
  },
  showResultsButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    marginLeft: 15,
    marginRight: 15
  },
  showResultsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  showMoreButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    marginLeft: 15,
    marginRight: 15
  },
  showMoreText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  detailsButtonText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  resultsScrollView: {
    maxHeight: 300,
    marginBottom: 8,
  },
});


export default TestSubject;
