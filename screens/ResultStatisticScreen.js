import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ResultStatisticScreen = () => {
  const [selectedTime, setSelectedTime] = useState('30');

  const Icons = {
    Book: () => (
      <View style={styles.icon}>
        <Text style={styles.iconText}>📚</Text>
      </View>
    ),
    Clock: () => (
      <View style={styles.icon}>
        <Text style={styles.iconText}>⏰</Text>
      </View>
    ),
    Calendar: () => (
      <View style={styles.icon}>
        <Text style={styles.iconText}>📅</Text>
      </View>
    ),
    Timer: () => (
      <View style={styles.icon}>
        <Text style={styles.iconText}>⌛</Text>
      </View>
    ),
    Target: () => (
      <View style={styles.icon}>
        <Text style={styles.iconText}>🎯</Text>
      </View>
    ),
  };

  const statItems = [
    { icon: <Icons.Book />, label: 'Tests Completed', value: '1', unit: 'test(s)' },
    { icon: <Icons.Clock />, label: 'Study Time', value: '0', unit: 'minutes' },
    { icon: <Icons.Calendar />, label: 'Exam Date', value: '13/11/2024', unit: '' },
    { icon: <Icons.Timer />, label: 'Days to Exam', value: '6', unit: 'days' },
    { icon: <Icons.Target />, label: 'Target Score', value: '800.0', unit: '' },
  ];

  const testHistory = [
    {
      date: '02/11/2024',
      name: 'New Economy TOEIC Test 10',
      tags: ['Full Test'],
      score: '0/200',
      time: '0:00:06',
    },
    {
      date: '02/11/2024',
      name: 'New Economy TOEIC Test 10',
      tags: ['Practice', 'Part 1'],
      score: '0/6',
      time: '0:00:06',
    },
    {
      date: '01/11/2024',
      name: 'New Economy TOEIC Test 10',
      tags: ['Practice', 'Part 1'],
      score: '0/6',
      time: '0:00:22',
    },
  ];

  const renderStatCard = (item, index) => (
    <View key={index} style={styles.statisticsItem}>
      {item.icon}
      <Text style={styles.statisticsLabel}>{item.label}</Text>
      <Text style={styles.statisticsValue}>{item.value}</Text>
      {item.unit && <Text style={styles.statisticsUnit}>{item.unit}</Text>}
    </View>
  );

  const renderTestHistoryItem = (item, index) => (
    <TouchableOpacity key={index} style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyDate}>{item.date}</Text>
        <Text style={styles.historyScore}>Score: {item.score}</Text>
      </View>
      
      <Text style={styles.historyTitle} numberOfLines={2}>{item.name}</Text>
      
      <View style={styles.historyContent}>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, idx) => (
            <View 
              key={idx} 
              style={[
                styles.tag,
                tag === 'Full Test' ? styles.fullTestTag : styles.practiceTag
              ]}
            >
              <Text style={tag === 'Full Test' ? styles.fullTestText : styles.practiceText}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.historyTime}>⏱ {item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>
        Result Statistics
      </Text>
      <Text style={styles.note}>
        Note: Results show for the last 30 days by default.
      </Text>

      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedTime}
            onValueChange={setSelectedTime}
            style={styles.picker}
          >
            <Picker.Item label="Last 30 Days" value="30" />
            <Picker.Item label="Last 60 Days" value="60" />
            <Picker.Item label="Last 90 Days" value="90" />
          </Picker>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statisticsContainer}>
        {statItems.map(renderStatCard)}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Test History</Text>
        <View style={styles.historyContainer}>
          {testHistory.map(renderTestHistoryItem)}
        </View>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All ▸</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainTitle: {
    marginTop: 30,
    fontWeight: '700',
    fontSize: 22,
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  note: {
    color: '#d9534f',
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#fff3cd',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  filterContainer: {
    padding: 16,
    gap: 12,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 8,
  },
  picker: {
    height: 48,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  statisticsContainer: {
    padding: 8,
  },
  statisticsItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  iconText: {
    fontSize: 28,
  },
  statisticsLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  statisticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statisticsUnit: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 12,
  },
  historyContainer: {
    gap: 8,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyDate: {
    color: '#6c757d',
    fontSize: 13,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212529',
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fullTestTag: {
    backgroundColor: '#d4edda',
  },
  practiceTag: {
    backgroundColor: '#fff3cd',
  },
  fullTestText: {
    color: '#155724',
    fontSize: 12,
  },
  practiceText: {
    color: '#856404',
    fontSize: 12,
  },
  historyScore: {
    color: '#007bff',
    fontSize: 13,
    fontWeight: '500',
  },
  historyTime: {
    color: '#6c757d',
    fontSize: 13,
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ResultStatisticScreen;
