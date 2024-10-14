import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import VocabCard from "../components/Vocab";
import colors from "../constants/colors";
import { TouchableOpacity } from "react-native";
import VocabSurveyScreen from "./VocabSurveyScreen";
import VocabLearnScreen from "./VocabLearnScreen";
import VocabTestScreen from "./VocabTestScreen";

const { width, height } = Dimensions.get('window');

const HomeVocabScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => console.log('Back pressed')}>
            <Text style={styles.navbarText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.navbarTitle}>Vocabulary</Text>
          <TouchableOpacity onPress={() => console.log('Menu pressed')}>
            <Text style={styles.navbarText}>TienZe</Text>
          </TouchableOpacity>
        </View>
        {[...Array(1)].map((_, i) => (
          <VocabLearnScreen key={i} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        paddingTop: height * 0.05,  // 5% chiều cao màn hình
        height: '100%',
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: height * 0.08,  // 8% chiều cao màn hình
        backgroundColor: colors.primary,
        paddingHorizontal: width * 0.05,  // 5% chiều rộng màn hình
        paddingVertical: 10,
    },
    navbarText: {
        color: 'white',
        fontSize: width * 0.04,  // Responsive font size
      },
      navbarTitle: {
        color: 'white',
        fontSize: width * 0.05,  // Responsive font size
        fontWeight: 'bold',
      },
});

export default HomeVocabScreen;
