import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainNavigator from '../navigation/MainNavigator';
import MainAppRoute from './MainAppRoute';

const Stack = createStackNavigator(); // Create Stack Navigator

const HomeRoute = () => {
  return (
    <Stack.Navigator initialRouteName="MainNavigator">
      <Stack.Screen 
        name="MainNavigator" 
        component={MainNavigator} 
        options={{ headerShown: false }} // Hide header for MainAppNavigator
      />
      <Stack.Screen 
        name="MainAppRoute" 
        component={MainAppRoute} 
        options={{ headerShown: false }} // Hide header for MainAppNavigator
      />
    </Stack.Navigator>
  );
};

export default HomeRoute;
