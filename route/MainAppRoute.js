import React from 'react';
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
import ResultTestPageScreen from '../screens/ResultTestPageScreen';
import ResultStatisticScreen from '../screens/ResultStatisticScreen';
import ScheduleScreen from '../screens/ScheduleScreen';


const Stack = createStackNavigator(); // Create Stack Navigator

const MainAppRoute = () => {
  return (
    <Stack.Navigator initialRouteName="MainAppNavigator">
      <Stack.Screen 
        name="MainNavigator" 
        component={MainNavigator} 
        options={{ headerShown: false }} // Hide header for MainAppNavigator
      />
      <Stack.Screen 
        name="MainAppNavigator" 
        component={MainAppNavigator} 
        options={{ headerShown: false }} // Hide header for MainAppNavigator
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
        name="ResultTestPageScreen"
        component={ResultTestPageScreen}
        options={{ 
          title: "Test Result",
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
      
    </Stack.Navigator>
  );
};

export default MainAppRoute;
