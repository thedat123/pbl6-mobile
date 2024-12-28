import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

const ResultStatisticScreen = () => {
  const [statData, setStatData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('listening');
  const [selectedTime, setSelectedTime] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatistics = async (day) => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/test-practice/user?day=${day}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setStatData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics(selectedTime);
  }, [selectedTime]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </SafeAreaView>
    );
  }

  const { totalTest, totalQuestion, totalAnswerCorrect, totalTime, maxScore, testPracticeCount, listen, read } = statData || {};

  const StatCard = ({ label, value, icon, style, valueStyle }) => (
    <View style={[styles.statsCard, style]}>
      <MaterialIcons name={icon} size={24} color="#666666" style={styles.cardIcon} />
      <Text style={styles.statsCardLabel}>{label}</Text>
      <Text style={[styles.statsCardValue, valueStyle]}>{value}</Text>
    </View>
  );

  const getPerformanceColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFA726';
    return '#F44336';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Learning Progress</Text>
          <Text style={styles.subtitle}>Track your improvement over time</Text>
        </View>

        {/* Time Period Selector */}
        <View style={styles.sectionContainer}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedTime}
              onValueChange={(value) => setSelectedTime(value)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Last 30 Days" value="30" />
              <Picker.Item label="Last 60 Days" value="60" />
              <Picker.Item label="Last 90 Days" value="90" />
            </Picker>
          </View>

          <View style={styles.statsGrid}>
            <StatCard 
              label="Total Tests" 
              value={totalTest}
              icon="assignment"
              valueStyle={{color: '#4CAF50'}}
            />
            <StatCard 
              label="Practice Sessions" 
              value={testPracticeCount}
              icon="school"
              valueStyle={{color: '#2196F3'}}
            />
            <StatCard 
              label="Study Time" 
              value={`${totalTime} min`}
              icon="access-time"
              valueStyle={{color: '#F44336'}}
            />
            <StatCard 
              label="Success Rate" 
              value={`${((totalAnswerCorrect/totalQuestion) * 100).toFixed(1)}%`}
              icon="trending-up"
              valueStyle={{color: getPerformanceColor((totalAnswerCorrect/totalQuestion) * 100)}}
            />
          </View>
        </View>

        {/* Tab Selector with Icons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'listening' && styles.activeTab]}
            onPress={() => setSelectedTab('listening')}
          >
            <MaterialIcons 
              name="headset" 
              size={24} 
              color={selectedTab === 'listening' ? 'white' : '#666666'} 
            />
            <Text style={[styles.tabText, selectedTab === 'listening' && styles.activeTabText]}>
              Listening
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'reading' && styles.activeTab]}
            onPress={() => setSelectedTab('reading')}
          >
            <MaterialIcons 
              name="menu-book" 
              size={24} 
              color={selectedTab === 'reading' ? 'white' : '#666666'} 
            />
            <Text style={[styles.tabText, selectedTab === 'reading' && styles.activeTabText]}>
              Reading
            </Text>
          </TouchableOpacity>
        </View>

        {/* Performance Details */}
        <View style={styles.performanceContainer}>
          {selectedTab === 'listening' && listen && (
            <>
              <View style={styles.performanceHeader}>
                <MaterialIcons name="headset" size={24} color="#2196F3" />
                <Text style={styles.performanceTitle}>Listening Performance</Text>
              </View>
              <View style={styles.performanceGrid}>
                <StatCard 
                  label="Tests Completed" 
                  value={listen.totalTest}
                  icon="assignment-turned-in"
                  valueStyle={{color: '#4CAF50'}}
                />
                <StatCard 
                  label="Success Rate" 
                  value={`${((listen.totalAnswerCorrect/listen.totalQuestion) * 100).toFixed(1)}%`}
                  icon="analytics"
                  valueStyle={{color: getPerformanceColor((listen.totalAnswerCorrect/listen.totalQuestion) * 100)}}
                />
                <StatCard 
                  label="Highest Score" 
                  value={listen.maxScore}
                  icon="emoji-events"
                  valueStyle={{color: '#FF9800'}}
                />
                <StatCard 
                  label="Average Score" 
                  value={listen.avgScore.toFixed(1)}
                  icon="show-chart"
                  valueStyle={{color: getPerformanceColor(listen.avgScore)}}
                />
              </View>
            </>
          )}

          {selectedTab === 'reading' && read && (
            <>
              <View style={styles.performanceHeader}>
                <MaterialIcons name="menu-book" size={24} color="#2196F3" />
                <Text style={styles.performanceTitle}>Reading Performance</Text>
              </View>
              <View style={styles.performanceGrid}>
                <StatCard 
                  label="Tests Completed" 
                  value={read.totalTest}
                  icon="assignment-turned-in"
                  valueStyle={{color: '#4CAF50'}}
                />
                <StatCard 
                  label="Success Rate" 
                  value={`${((read.totalAnswerCorrect/read.totalQuestion) * 100).toFixed(1)}%`}
                  icon="analytics"
                  valueStyle={{color: getPerformanceColor((read.totalAnswerCorrect/read.totalQuestion) * 100)}}
                />
                <StatCard 
                  label="Highest Score" 
                  value={read.maxScore}
                  icon="emoji-events"
                  valueStyle={{color: '#FF9800'}}
                />
                <StatCard 
                  label="Average Score" 
                  value={read.avgScore.toFixed(1)}
                  icon="show-chart"
                  valueStyle={{color: getPerformanceColor(read.avgScore)}}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  sectionContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerWrapper: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    marginBottom: 8,
  },
  statsCardLabel: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  performanceContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});

export default ResultStatisticScreen;