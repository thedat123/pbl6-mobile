import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const TestPartSelector = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedParts, timeLimit } = route.params;

  const parts = [
    {
      number: 1,
      title: 'Part 1',
      subtitle: '6 questions',
      tags: ['People', 'Objects', 'Situations']
    },
    {
      number: 2,
      title: 'Part 2',
      subtitle: '25 questions',
      tags: ['WH Questions', 'Yes/No', 'Tag Questions']
    },
    {
      number: 3,
      title: 'Part 3',
      subtitle: '39 questions',
      tags: ['Business', 'Office Work', 'Services']
    },
    {
      number: 4,
      title: 'Part 4',
      subtitle: '30 questions',
      tags: ['Business', 'Office Work', 'Services']
    },
    {
      number: 5,
      title: 'Part 5',
      subtitle: '30 questions',
      tags: ['Business', 'Office Work', 'Services']
    },
    {
      number: 6,
      title: 'Part 6',
      subtitle: '16 questions',
      tags: ['Business', 'Office Work', 'Services']
    },
    {
      number: 7,
      title: 'Part 7',
      subtitle: '54 questions',
      tags: ['Emails', 'Articles', 'Forms']
    }
  ];

  const selectedPartsData = parts.filter(part => selectedParts.includes(part.number));

  const renderPartCard = (part) => (
    <TouchableOpacity
      key={part.number}
      style={styles.partCard}
      onPress={() => navigation.navigate(`TestPart${part.number}`)}
    >
      <View style={styles.partHeader}>
        <View style={styles.partTitleContainer}>
          <Text style={styles.partTitle}>Part {part.number}</Text>
          <Text style={styles.partSubtitle}>{part.subtitle}</Text>
        </View>
        <View style={styles.startContainer}>
          <Text style={styles.startText}>Start →</Text>
        </View>
      </View>
      
      <View style={styles.tagsContainer}>
        {part.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Selected Parts</Text>
          {timeLimit && (
            <Text style={styles.timeLimit}>Time Limit: {timeLimit} minutes</Text>
          )}
        </View>

        <View style={styles.partsContainer}>
          {selectedPartsData.map(renderPartCard)}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Part Selection</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  timeLimit: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  partsContainer: {
    gap: 16,
  },
  partCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  partTitleContainer: {
    flex: 1,
  },
  partTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  partSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  startContainer: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startText: {
    color: 'white',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#4A90E2',
  },
  backButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
};

export default TestPartSelector;