import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { API_BASE_URL } from '@env';
import axios from "axios";

const TestDetailResult = () => {
  const route = useRoute();
  const { result } = route.params;
  const navigation = useNavigation();
  const [fullTotalQuestion, setFullTotalQuestion] = useState(0);
  const [parts, setParts] = useState([]);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []); 

  useEffect(() => {
    const calculateTotalQuestions = (partsSource, selectedParts, listParts) => {
      const allParts = [...new Set([...selectedParts, ...listParts])];
      return allParts.reduce((total, partKey) => {
        const part = partsSource.find((p) => p.key === partKey || p.name === partKey);
        return part ? total + part.totalQuestion : total;
      }, 0);
    };
  
    const selectedParts = result.test?.selectedParts || [];
    const listParts = result.listPart || [];
  
    if (listParts.length > 0) {
      axios.get(`${API_BASE_URL}:3001/api/v1/part`)
        .then((response) => {
          setParts(response.data);
          setFullTotalQuestion(calculateTotalQuestions(response.data, selectedParts, listParts));
        })
        .catch((error) => {
          console.error('Error fetching parts data:', error);
        });
    } else {
      axios.get(`${API_BASE_URL}:3001/api/v1/part`)
        .then((response) => {
          setParts(response.data);
          setFullTotalQuestion(calculateTotalQuestions(response.data, selectedParts, []));
        })
        .catch((error) => {
          console.error('Error fetching parts data:', error);
        });
    }
  }, [result]);
  

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: "center", marginTop: 20 }}>No result data available.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.primaryButton}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const testName = result.test?.name || "Unknown Test";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{testName}</Text>
          <Text style={styles.subtitle}>Test Results</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <Icon name="checkbox-marked-circle-outline" size={28} color="#4CAF50" />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Result</Text>
                <Text style={styles.statsValue}>{`${result.numCorrect}/${fullTotalQuestion}`}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <Icon name="percent" size={28} color="#2196F3" />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Accuracy</Text>
                <Text style={styles.statsValue}>
                  {((result.numCorrect / fullTotalQuestion) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <Icon name="clock-outline" size={28} color="#FFC107" />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Time</Text>
                <Text style={styles.statsValue}>{formatTime(result.time)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.resultCardsContainer}>
          <View style={[styles.resultCard, styles.correctCard]}>
            <Icon name="check-circle" size={36} color="#4CAF50" />
            <Text style={styles.resultCount}>{result.numCorrect}</Text>
            <Text style={styles.resultTitle}>Correct</Text>
          </View>

          <View style={[styles.resultCard, styles.wrongCard]}>
            <Icon name="close-circle" size={36} color="#F44336" />
            <Text style={styles.resultCount}>
              {result.totalQuestion - result.numCorrect}
            </Text>
            <Text style={styles.resultTitle}>Incorrect</Text>
          </View>

          <View style={[styles.resultCard, styles.skippedCard]}>
            <Icon name="minus-circle" size={36} color="#9E9E9E" />
            <Text style={styles.resultCount}>
              {fullTotalQuestion - result.numCorrect - (result.totalQuestion - result.numCorrect)}
            </Text>
            <Text style={styles.resultTitle}>Skipped</Text>
          </View>
        </View>

        {/* Score Cards */}
        <View style={styles.scoreCardsContainer}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Icon name="headphones" size={28} color="#1a237e" />
              <Text style={styles.scoreTitle}>LC Score</Text>
            </View>
            <Text style={styles.scoreValue}>{result.LCScore}</Text>
          </View>

          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Icon name="book-open-variant" size={28} color="#1a237e" />
              <Text style={styles.scoreTitle}>RC Score</Text>
            </View>
            <Text style={styles.scoreValue}>{result.RCScore}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("MainAppNavigator")}>
            <Text style={styles.buttonText}>Back to Exams Library</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#1a237e",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#B0BEC5",
  },
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statsTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  resultCardsContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
  },
  resultCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  correctCard: {
    backgroundColor: "#E8F5E9",
  },
  wrongCard: {
    backgroundColor: "#FFEBEE",
  },
  skippedCard: {
    backgroundColor: "#ECEFF1",
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 4,
  },
  resultCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 8,
  },
  scoreCardsContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a237e",
    marginLeft: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#1a237e",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a237e",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#1a237e",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TestDetailResult;

