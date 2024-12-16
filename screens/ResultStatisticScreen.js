import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResultStatisticScreen = () => {
  const [statData, setStatData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('listening');
  const [selectedTime, setSelectedTime] = useState('30');

  const fetchStatistics = async (day) => {
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
      }
  };

  useEffect(() => {
      fetchStatistics(selectedTime);
  }, [selectedTime]);

  if (!statData) {
      return (
          <SafeAreaView style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading statistics...</Text>
          </SafeAreaView>
      );
  }

  const { totalTest, totalQuestion, totalAnswerCorrect, totalTime, maxScore, testPracticeCount, listen, read } = statData;

  const StatCard = ({ label, value, style, valueStyle }) => (
    <View style={[styles.statsCard, style]}>
      <Text style={styles.statsCardLabel}>{label}</Text>
      <Text style={[styles.statsCardValue, valueStyle]}>{value}</Text>
    </View>
  );

  return (
      <SafeAreaView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
              {/* Page Title */}
              <Text style={styles.pageTitle}>Learning Progress</Text>

              {/* General Statistics Section */}
              <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Overview</Text>
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
                        valueStyle={{color: '#4CAF50'}} 
                      />
                      <StatCard 
                        label="Practice Sessions" 
                        value={testPracticeCount} 
                        valueStyle={{color: '#2196F3'}} 
                      />
                      <StatCard 
                        label="Total Questions" 
                        value={totalQuestion} 
                        valueStyle={{color: '#FF9800'}} 
                      />
                      <StatCard 
                        label="Correct Answers" 
                        value={totalAnswerCorrect} 
                        valueStyle={{color: '#9C27B0'}} 
                      />
                      <StatCard 
                        label="Study Time" 
                        value={`${totalTime} minutes`} 
                        valueStyle={{color: '#F44336'}} 
                      />
                      <StatCard 
                        label="Highest Score" 
                        value={maxScore} 
                        valueStyle={{color: '#FF5722'}} 
                      />
                  </View>
              </View>

              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                  <TouchableOpacity
                      style={[
                          styles.tabButton, 
                          selectedTab === 'listening' && styles.activeTab
                      ]}
                      onPress={() => setSelectedTab('listening')}
                  >
                      <Text style={[
                          styles.tabText, 
                          selectedTab === 'listening' && styles.activeTabText
                      ]}>Listening</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={[
                          styles.tabButton, 
                          selectedTab === 'reading' && styles.activeTab
                      ]}
                      onPress={() => setSelectedTab('reading')}
                  >
                      <Text style={[
                          styles.tabText, 
                          selectedTab === 'reading' && styles.activeTabText
                      ]}>Reading</Text>
                  </TouchableOpacity>
              </View>

              {/* Performance Details */}
              <View style={styles.performanceContainer}>
                  {selectedTab === 'listening' && (
                      <>
                          <StatCard 
                            label="Listening Tests" 
                            value={listen.totalTest} 
                            style={styles.performanceMainCard} 
                            valueStyle={{color: '#2196F3', fontSize: 20}}
                          />
                          <View style={styles.performanceGrid}>
                              <StatCard 
                                label="Total Questions" 
                                value={listen.totalQuestion} 
                                valueStyle={{color: '#4CAF50'}} 
                              />
                              <StatCard 
                                label="Correct Answers" 
                                value={listen.totalAnswerCorrect} 
                                valueStyle={{color: '#9C27B0'}} 
                              />
                              <StatCard 
                                label="Highest Score" 
                                value={listen.maxScore} 
                                valueStyle={{color: '#FF9800'}} 
                              />
                              <StatCard 
                                label="Average Score" 
                                value={listen.avgScore.toFixed(2)} 
                                valueStyle={{color: '#FF5722'}} 
                              />
                          </View>
                      </>
                  )}

                  {selectedTab === 'reading' && (
                      <>
                          <StatCard 
                            label="Reading Tests" 
                            value={read.totalTest} 
                            style={styles.performanceMainCard} 
                            valueStyle={{color: '#2196F3', fontSize: 20}}
                          />
                          <View style={styles.performanceGrid}>
                              <StatCard 
                                label="Total Questions" 
                                value={read.totalQuestion} 
                                valueStyle={{color: '#4CAF50'}} 
                              />
                              <StatCard 
                                label="Correct Answers" 
                                value={read.totalAnswerCorrect} 
                                valueStyle={{color: '#9C27B0'}} 
                              />
                              <StatCard 
                                label="Highest Score" 
                                value={read.maxScore} 
                                valueStyle={{color: '#FF9800'}} 
                              />
                              <StatCard 
                                label="Average Score" 
                                value={read.avgScore.toFixed(2)} 
                                valueStyle={{color: '#FF5722'}} 
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
      backgroundColor: '#FFFFFF',
  },
  pageTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333333',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
  },
  loadingText: {
      fontSize: 18,
      color: '#666666',
  },
  sectionContainer: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: '#F5F5F5',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333333',
      marginBottom: 12,
  },
  pickerWrapper: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E0E0E0',
  },
  statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
  },
  statsCard: {
      width: '48%',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
  },
  statsCardLabel: {
      color: '#666666',
      fontSize: 13,
      marginBottom: 4,
  },
  statsCardValue: {
      color: '#333333',
      fontSize: 16,
      fontWeight: '700',
  },
  tabContainer: {
      flexDirection: 'row',
      marginHorizontal: 16,
      backgroundColor: '#F5F5F5',
      borderRadius: 10,
      marginBottom: 16,
  },
  tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 10,
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
  },
  performanceMainCard: {
      backgroundColor: '#E3F2FD',
      marginBottom: 16,
  },
  performanceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
  },
});

export default ResultStatisticScreen;