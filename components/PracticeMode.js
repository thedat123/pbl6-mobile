import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const PracticeMode = () => {
  const route = useRoute();
  const [selectedParts, setSelectedParts] = useState(new Set());
  const [selectedTime, setSelectedTime] = useState(null);
  const [parts, setParts] = useState([]); 
  const navigation = useNavigation();
  const { id, test } = route.params;

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);   

  const fetchParts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${id}`);
      if (response.data) {
        const testData = response.data;
  
        const partsResponse = await axios.get(`${API_BASE_URL}:3001/api/v1/part`);
        const allParts = partsResponse.data;
  
        const availableParts = testData.groupQuestions.reduce((acc, group) => {
          if (group.part?.key) {
            const matchingPart = allParts.find(part => part.key === group.part.key);
  
            if (matchingPart && !acc.some(part => part.key === matchingPart.key)) {
              acc.push({
                key: matchingPart.key,
                name: matchingPart.name,
                totalQuestion: matchingPart.totalQuestion,
              });
            }
          }
          return acc;
        }, []);
  
        const sortedParts = availableParts.sort((a, b) => a.key.localeCompare(b.key));
        setParts(sortedParts);
      } else {
        throw new Error('No data found for this test');
      }
    } catch (error) {
      console.error('Error fetching parts:', error.message);
    }
  }, [id]);    

  useEffect(() => {
    fetchParts(); 
  }, [fetchParts]);

  const togglePart = (partId) => {
    setSelectedParts((prevSelectedParts) => {
      const newSelected = new Set(prevSelectedParts);
      if (newSelected.has(partId)) {
        newSelected.delete(partId);
      } else {
        newSelected.add(partId);
      }
      return newSelected;
    });
  };

  const handleStart = () => {
    if (selectedParts.size > 0) {
      const selectedPartIds = Array.from(selectedParts).map((key) => {
        return `Part ${key.replace('part', '')}`;
      });
      navigation.navigate('TestBase', {
        selectedParts: selectedPartIds,
        timeLimit: selectedTime,
        testId: id,
      });
    }
  };  

  const renderTip = () => (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Text style={styles.tipTitle}>💡 Pro Tip</Text>
      </View>
      <Text style={styles.tipContent}>
        Practice individual sections with appropriate time limits to focus on accuracy rather than rushing through under exam pressure.
      </Text>
    </View>
  );
  
  const renderPart = (part) => (
    <TouchableOpacity
      key={part.key} 
      style={[
        styles.partCard,
        selectedParts.has(part.key) && styles.partCardSelected,
      ]}
      onPress={() => togglePart(part.key)}
    >
      <View style={styles.partHeader}>
        <View style={styles.partTitleContainer}>
          <Text style={styles.partTitle}>{part.name}</Text>
          <Text style={styles.partSubtitle}>{part.totalQuestion} questions</Text>
        </View>
        <View
          style={[
            styles.checkbox,
            selectedParts.has(part.key) && styles.checkboxSelected,
          ]}
        >
          {selectedParts.has(part.key) && (
            <Entypo name="check" size={16} color="white" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
      

  const renderTimePicker = () => (
    <View style={styles.timePickerContainer}>
      <Text style={styles.timePickerLabel}>Time Limit</Text>
      <Text style={styles.timePickerHint}>Leave empty for unlimited time</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedTime}
          onValueChange={setSelectedTime}
          style={styles.picker}
        >
          <Picker.Item label="Select time limit" value={null} />
          {Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map((time) => (
            <Picker.Item key={time} label={`${time} minutes`} value={time} />
          ))}
        </Picker>
      </View>
    </View>
  );  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {renderTip()}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Test Sections</Text>
          {parts.map(renderPart)}
        </View>
        {renderTimePicker()}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.startButton,
          selectedParts.size === 0 && styles.startButtonDisabled,
        ]}
        disabled={selectedParts.size === 0}
        onPress={handleStart}
      >
        <Text style={styles.startButtonText}>
          Start Practice {selectedParts.size > 0 ? `(${selectedParts.size} sections)` : ''}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  tipCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  tipHeader: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tipContent: {
    padding: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  partCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  partCardSelected: {
    backgroundColor: '#F0F7FF',
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  partTitleContainer: {
    flex: 1,
  },
  partTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  partSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  partDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#4B5563',
  },
  timePickerContainer: {
    padding: 16,
    marginBottom: 100,
  },
  timePickerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timePickerHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    overflow: 'hidden',
  },
  picker: {
    height: 60,
  },
  startButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  startButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  navigationButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  multipleNavigationContainer: {
    marginTop: 16,
    gap: 8,
  }
});

export default PracticeMode;