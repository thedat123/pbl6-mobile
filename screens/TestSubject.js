import React, { useState } from 'react';
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

const TestSubject = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState('Practice');

  // Function to render the appropriate component based on the active tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'Practice':
        return <PracticeMode />;
      case 'Full Test':
        return <FullMode />;
      case 'Discussion':
        return <Comment />;
      default:
        return null;
    }
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['Practice', 'Full Test', 'Discussion'].map((tab) => (
        <TouchableOpacity 
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)} // Set active tab on press
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TestSubjectHeader />
      {renderTabs()}
      {/* Render the active component based on the active tab */}
      {renderActiveComponent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
});

export default TestSubject;
