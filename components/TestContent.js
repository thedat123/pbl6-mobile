// TestContent.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FullTestNotice from './FullTestNotice';
import CommentsSection from './CommentsSection';

const TestContent = ({ activeTab, parts, comments, addComment, comment, setComment, selectedParts, togglePart }) => {
  switch (activeTab) {
    case 'practice':
      return <View style={styles.content}><Text>Practice content here</Text></View>;
    case 'fullTest':
      return (
        <View style={styles.content}>
          <FullTestNotice />
          <TouchableOpacity style={styles.startTestButton}>
            <Text style={styles.startTestButtonText}>BẮT ĐẦU THI</Text>
          </TouchableOpacity>
        </View>
      );
    case 'discussion':
      return <CommentsSection comments={comments} addComment={addComment} comment={comment} setComment={setComment} />;
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  content: { padding: 16 },
  startTestButton: { backgroundColor: '#3F51B5', padding: 16, borderRadius: 12 },
  startTestButtonText: { color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
});

export default TestContent;
