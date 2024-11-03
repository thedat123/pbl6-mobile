import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, ScrollView, Animated } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { LineChart } from 'react-native-chart-kit';
import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const VocabResultScreen = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [progress, setProgress] = useState(0); // Create a state to store the progress value
  const progressAnimation = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    // Add listener to the animated value to update the state with the number
    progressAnimation.addListener(({ value }) => {
      setProgress(value);
    });

    // Start animation
    Animated.timing(progressAnimation, {
      toValue: 0.35, // Target value
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Cleanup the listener on unmount
    return () => progressAnimation.removeAllListeners();
  }, [progressAnimation]);

  const renderProgressStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Từ đã thuộc</Text>
        <Text style={styles.statValue}>7/20</Text>
        <Text style={styles.statSubtext}>từ vựng</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Thời gian</Text>
        <Text style={styles.statValue}>67</Text>
        <Text style={styles.statSubtext}>giây</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Kết quả kiểm tra</Text>
          <Text style={styles.subtitle}>Chủ đề: Từ vựng cơ bản</Text>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.progressContainer}>
            <ProgressCircle
              style={styles.progressCircle}
              progress={progress} // Pass the progress value from state
              progressColor={'#4CAF50'}
              backgroundColor={'#E8F5E9'}
              strokeWidth={15}
            />
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.progressLabel}>Hoàn thành</Text>
            </View>
          </View>
          
          {renderProgressStats()}
        </View>

        <View style={styles.messageCard}>
          <View style={styles.messageIcon}>
            <Text style={styles.emoji}>💪</Text>
          </View>
          <Text style={styles.messageTitle}>Cố gắng hơn nữa!</Text>
          <Text style={styles.messageText}>
            Bạn có thể làm tốt hơn đấy! Hãy ôn tập lại và thử sức lần nữa nhé.
          </Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tiến độ học tập</Text>
          <LineChart
            data={{
              labels: ['Lần 1', 'Lần 2', 'Hiện tại'],
              datasets: [{
                data: [15, 25, 35],
              }],
            }}
            width={width - 60}
            height={180}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.button, styles.reviewButton]} onPress={() => navigation.navigate('VocabLearnScreen')}>
            <Text style={styles.reviewButtonText}>Học lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.retryButton]} onPress={() => navigation.navigate('VocabTestScreen')}>
            <Text style={styles.retryButtonText}>Kiểm tra lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    height: 180,
    width: 180,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  statSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  messageIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 30,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: '#1A237E',
    marginRight: 10,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VocabResultScreen;
