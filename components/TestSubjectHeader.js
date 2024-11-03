import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TestSubjectHeader = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'info',
      label: 'Test Information',
      icon: 'information-circle-outline'
    },
    { 
      id: 'answers',
      label: 'Answers/Transcript',
      icon: 'document-text-outline'
    }
  ];

  const testInfo = {
    duration: '120 minutes',
    sections: '7 sections',
    questions: '200 questions',
    comments: '143 comments',
    participants: '227,127 participants'
  };

  const renderTestInfo = () => (
    <View style={styles.infoContainer}>
      <View style={styles.statsRow}>
        <Ionicons name="time-outline" size={20} color="#4B5563" />
        <Text style={styles.statsText}>{testInfo.duration}</Text>
        <View style={styles.statsDiv} />
        <Ionicons name="layers-outline" size={20} color="#4B5563" />
        <Text style={styles.statsText}>{testInfo.sections}</Text>
        <View style={styles.statsDiv} />
        <Ionicons name="help-circle-outline" size={20} color="#4B5563" />
        <Text style={styles.statsText}>{testInfo.questions}</Text>
      </View>
      
      <View style={styles.statsRow}>
        <Ionicons name="chatbubble-outline" size={18} color="#4B5563" />
        <Text style={styles.statsText}>{testInfo.comments}</Text>
        <View style={styles.statsDiv} />
        <Ionicons name="people-outline" size={20} color="#4B5563" />
        <Text style={styles.statsText}>{testInfo.participants}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>#TOEIC</Text>
            <View style={styles.levelTag}>
              <Text style={styles.levelText}>Test 10</Text>
            </View>
          </View>
          <Text style={styles.title}>New Economy TOEIC</Text>
          {renderTestInfo()}
        </View>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? '#2563EB' : '#6B7280'} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    padding: 16,
  },
  titleSection: {
    gap: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  infoContainer: {
    marginTop: 12,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  statsDiv: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    backgroundColor: '#F8FAFC',
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default TestSubjectHeader;