import React from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const VocabCard = ({ word, level }) => {
  const navigation = useNavigation();
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Set color and label based on level
  const getLevelDetails = (level) => {
    switch (level) {
      case 'elementary':
        return { color: '#4CAF50', text: 'Sơ cấp' };
      case 'intermediate':
        return { color: '#FF9800', text: 'Trung cấp' };
      case 'advanced':
        return { color: '#F44336', text: 'Cao cấp' };
      default:
        return { color: '#9E9E9E', text: 'Tất cả' };
    }
  };

  const levelDetails = getLevelDetails(level);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate("VocabDetailScreen")}
      >
        <Animated.View style={[
          styles.card,
          { transform: [{ scale: scaleValue }] }
        ]}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'http://192.168.100.101:8081/assets/images/Vocab/vocab_image.png' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={[
              styles.difficulty,
              { backgroundColor: levelDetails.color }
            ]}>
              <MaterialIcons name="signal-cellular-alt" size={16} color="#FFF" />
              <Text style={styles.difficultyText}>{levelDetails.text}</Text>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{word}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  difficulty: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  tagBiology: {
    backgroundColor: '#FF9800',
  },
  tagQuestions: {
    backgroundColor: '#2196F3',
  },
  tagText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default VocabCard;