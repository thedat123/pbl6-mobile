// TestTabs.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const TestTabs = ({ activeTab, setActiveTab }) => (
  <View style={styles.tabContainer}>
    {['practice', 'fullTest', 'discussion'].map((tab) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, activeTab === tab && styles.activeTab]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {tab === 'practice' ? 'Luyện tập' : tab === 'fullTest' ? 'Làm full test' : 'Thảo luận'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3F51B5',
  },
  tabText: {
    fontSize: 16,
    color: '#757575',
  },
  activeTabText: {
    color: '#3F51B5',
    fontWeight: 'bold',
  },
});

export default TestTabs;
