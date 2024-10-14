import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import { VictoryChart, VictoryLine } from 'victory-native';

const { width } = Dimensions.get('window');

const VocabResultScreen = () => {
  return (
    <View style={styles.container}>
      {/* Top Section */}
      <View style={styles.topSection}>
        <Text style={styles.message}>
          Bạn đã vượt qua chủ đề từ vựng này. Tuy nhiên hãy kiểm tra lại để có kết quả cao hơn!
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Học Lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Kiểm Tra Lại</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result Section */}
      <View style={styles.resultSection}>
        <ProgressCircle
          style={styles.progressCircle}
          progress={0.85}
          progressColor={'#00E676'}
          backgroundColor={'#D3D3D3'}
        />
        <Text style={styles.resultText}>85%</Text>
        <View style={styles.resultDetails}>
          <Text style={styles.detailText}>Từ đã thuộc: <Text style={styles.good}>17 từ</Text></Text>
          <Text style={styles.detailText}>Thời gian: <Text style={styles.good}>56 giây</Text></Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <VictoryChart width={width * 0.8}>
          <VictoryLine
            style={{
              data: { stroke: '#FFC107' },
              parent: { border: '1px solid #ccc' },
            }}
            data={[{ x: 1, y: 5 }, { x: 2, y: 15 }, { x: 3, y: 10 }, { x: 4, y: 20 }]}
          />
        </VictoryChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  topSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressCircle: {
    height: 150,
    width: 150,
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00E676',
    marginTop: -110,
  },
  resultDetails: {
    marginTop: 10,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 18,
    marginBottom: 5,
  },
  good: {
    color: '#00E676',
    fontWeight: 'bold',
  },
  chartSection: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default VocabResultScreen;
