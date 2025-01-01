import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainAppNavigator from '../navigation/MainAppNavigator';
import VocabCard from '../components/Vocab';
import VocabDetailScreen from '../screens/VocabDetailScreen';
import VocabLearnScreen from '../screens/VocabLearnScreen';
import VocabWaitScreen from '../screens/VocabWaitScreen';
import VocabTestScreen from '../screens/VocabTestScreen';
import VocabResultScreen from '../screens/VocabResultScreen';
import TestSubject from '../screens/TestSubject';
import { Ionicons } from '@expo/vector-icons';
import TestPart1 from '../screens/TestPart1';
import TestPart2 from '../screens/TestPart2';
import TestPart3 from '../screens/TestPart3';
import TestPart4 from '../screens/TestPart4';
import TestPart5 from '../screens/TestPart5';
import TestPart6 from '../screens/TestPart6';
import TestPart7 from '../screens/TestPart7';
import TestPartSelector from '../components/TestPartSelector';
import TestBase from '../components/TestBase';
import MainNavigator from '../navigation/MainNavigator';
import ResultStatisticScreen from '../screens/ResultStatisticScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import TestScreen from '../screens/TestScreen';
import SignInForm from '../components/SignInForm';
import TestDetailResult from '../screens/TestDetailResult';
import PersonalWorldFolderScreen from '../screens/PersonalWordFolderScreen';
import FolderWordDetail from '../screens/FolderWordDetail';
import AnswerTranscriptScreen from '../screens/AnswerTranscriptScreen';
import TestPart1Answer from '../screens/TestPart1Answer';
import TestPart2Answer from '../screens/TestPart2Answer';
import TestPart3Answer from '../screens/TestPart3Answer';
import TestPart4Answer from '../screens/TestPart4Answer';
import TestPart5Answer from '../screens/TestPart5Answer';
import TestPart6Answer from '../screens/TestPart6Answer';
import FullAnswersScreen from '../screens/FullAnswersScreen';
import ListenTest from '../screens/ListenTest';
import ListenTestPractice from '../screens/ListenTestPractice';
import ListenTestResult from '../screens/ListenTestResult';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TestPart7Answer from '../screens/TestPart7Answer';


const Stack = createStackNavigator();

const MainAppRoute = () => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (error) {
        console.error('Error retrieving token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={token ? 'MainAppNavigator' : 'MainNavigator'}>
      <Stack.Screen 
        name="MainNavigator" 
        component={MainNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MainAppNavigator" 
        component={MainAppNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VocabCard" 
        component={VocabCard} 
        options={{ headerShown: false }} // Hide header for VocabCard
      />
      <Stack.Screen 
        name="VocabDetailScreen" 
        component={VocabDetailScreen} 
        options={{ title: "Vocabulary Details", headerBackImage: () => (
          <Ionicons name="arrow-back" size={28} color="#000" />
        ) }} // Custom title for VocabDetailScreen
      />
      <Stack.Screen 
        name="VocabLearnScreen"
        component={VocabLearnScreen}
        options={{ title: "Vocabulary Learning", headerBackImage: () => (
          <Ionicons name="arrow-back" size={28} color="#000" />
        ) }} // Custom title for VocabLearnScreen
      />
      <Stack.Screen 
        name="VocabWaitScreen"
        component={VocabWaitScreen}
        options={{ headerShown: false, headerBackImage: () => (
          <Ionicons name="arrow-back" size={28} color="#000" />
        )
        }} // Hide header for MainAppNavigator
      />
      <Stack.Screen 
        name="VocabTestScreen"
        component={VocabTestScreen}
        options={{ title: "Vocabulary Test", headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ) 
        }} // Hide header for MainAppNavigator
      />
      <Stack.Screen 
        name="VocabResultScreen"
        component={VocabResultScreen}
        options={{ 
          title: "Vocabulary Test Result",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ), 
        }} 
      />
      <Stack.Screen 
        name="TestSubject"
        component={TestSubject}
        options={{ 
          title: "Test Subject",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestScreen"
        component={TestScreen}
      />
      <Stack.Screen 
        name="ListenTest"
        component={ListenTest}
        options={{ 
          title: "Listen Test",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="ListenTestPractice"
        component={ListenTestPractice}
        options={{ 
          title: "Listen Test Practice",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="ListenTestResult"
        component={ListenTestResult}
        options={{ 
          title: "Listen Test Result",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart1"
        component={TestPart1}
        options={{ 
          title: "Part 1",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart2"
        component={TestPart2}
        options={{ 
          title: "Part 2",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart3"
        component={TestPart3}
        options={{ 
          title: "Part 3",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart4"
        component={TestPart4}
        options={{ 
          title: "Part 4",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart5"
        component={TestPart5}
        options={{ 
          title: "Part 5",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart6"
        component={TestPart6}
        options={{ 
          title: "Part 6",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart7"
        component={TestPart7}
        options={{ 
          title: "Part 7",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestBase"
        component={TestBase}
        options={{ 
          title: "Test",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="ResultStatisticScreen"
        component={ResultStatisticScreen}
        options={{ 
          title: "Result Statistics",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{ 
          title: "Schedule Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="SignInForm"
        component={SignInForm}
      />
      <Stack.Screen 
        name="TestDetailResult"
        component={TestDetailResult}
        options={{ 
          title: "Test Result Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="PersonalWordFolderScreen"
        component={PersonalWorldFolderScreen}
        options={{ 
          title: "Personal Word Folder Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="FolderWordDetail"
        component={FolderWordDetail}
        options={{ 
          title: "Folder Word Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="AnswerTranscriptScreen"
        component={AnswerTranscriptScreen}
      />
      <Stack.Screen 
        name="TestPart1Answer"
        component={TestPart1Answer}
        options={{ 
          title: "Test Part 1 Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart2Answer"
        component={TestPart2Answer}
        options={{ 
          title: "Test Part 2 Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart3Answer"
        component={TestPart3Answer}
        options={{ 
          title: "Test Part 3 Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart4Answer"
        component={TestPart4Answer}
        options={{ 
          title: "Test Part 4 Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart5Answer"
        component={TestPart5Answer}
        options={{ 
          title: "Test Part 5 Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart6Answer"
        component={TestPart6Answer}
        options={{ 
          title: "Test Part 6 Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="TestPart7Answer"
        component={TestPart7Answer}
        options={{ 
          title: "Test Part 7 Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
      <Stack.Screen 
        name="FullAnswers"
        component={FullAnswersScreen}
        options={{ 
          title: "Full Detail Screen",
          headerBackImage: () => (
            <Ionicons name="arrow-back" size={28} color="#000" />
          ),
        }} 
      />
    </Stack.Navigator>
  );
};

export default MainAppRoute;
