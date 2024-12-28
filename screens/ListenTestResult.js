import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Check } from 'react-native-feather';

const ListenTestResult = ({ route, navigation }) => {
  const { onRepeat } = route.params;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Great job! 🎉</Text>
        <Text style={styles.subheading}>You've successfully completed this exercise.</Text>

        <Animated.View
          style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}
        >
          <Check stroke="#fff" width={60} height={60} />
        </Animated.View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.repeatButton]}
            onPress={onRepeat}
            activeOpacity={0.8}
          >
            <Text style={styles.repeatButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={() => navigation.navigate('MainAppNavigator')} 
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 18,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 40,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  repeatButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  nextButton: {
    backgroundColor: '#228BE6',
  },
  repeatButtonText: {
    color: '#495057',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ListenTestResult;
