import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FullMode = () => {
  const navigation = useNavigation();

  const handleStart = () => {
    // Array of all part numbers
    const allParts = [1, 2, 3, 4, 5, 6, 7];
    // Navigate to TestBase, passing all parts selected
    navigation.navigate('TestBase', {
      selectedParts: allParts,
      timeLimit: 120 // Set a time limit if needed
    });
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
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
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
