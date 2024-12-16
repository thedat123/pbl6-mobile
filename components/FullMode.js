import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const FullMode = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [parts, setParts] = useState([]);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []); 

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}:3001/api/v1/test/${id}`);
        if (response.data) {
          const testData = response.data;

          const availableParts = testData.groupQuestions.reduce((acc, group) => {
            if (group.part?.key && !acc.some(part => part.key === group.part.key)) {
              acc.push({
                key: group.part.key,
                name: `Part ${group.part.key.replace('part', '')}`,
              });
            }
            return acc;
          }, []);

          const sortedParts = availableParts.map(part => part.name);
          setParts(sortedParts);
        } else {
          throw new Error('No data found for this test');
        }
      } catch (error) {
        console.error('Error fetching parts:', error.message);
      }
    };

    fetchParts();
  }, [id]);

  const handleStart = () => {
    if (parts.length > 0) {
      navigation.navigate('TestBase', {
        selectedParts: parts,
        timeLimit: 120,
        testId: id,
      });
    }
  };

  const renderTip = () => (
    <View style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <Text style={styles.tipIcon}>ℹ️</Text>
        <Text style={styles.tipContent}>
          Ready to start the full test? To achieve the best results, you should set aside 120 minutes for this test.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {renderTip()}
      </ScrollView>
      <TouchableOpacity
        style={[styles.startButton, parts.length === 0 && styles.startButtonDisabled]}
        disabled={parts.length === 0}
        onPress={handleStart}
      >
        <Text style={styles.startButtonText}>START TEST</Text>
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
  tipCard: {
    margin: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 24,
    color: '#856404',
    marginRight: 12,
  },
  tipContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#856404',
    flex: 1,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default FullMode;
