import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Image, View } from "react-native";
import SignUpForm from "../components/SignUpForm";
import "react-native-gesture-handler";
import SignInForm from "../components/SignInForm";
import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeNavigator from "./HomeNavigator";

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{
      headerShadowVisible: false,
      headerTitleAlign: 'center',  
    }}>
      <Tab.Screen name="SignUp" component={AuthScreen} options={{
          tabBarLabel: () => null,  // Hides the label in the tab
          headerShown: false,  // If you want to hide the header too
      }} />
      <Tab.Screen name="Homepage" component={HomeNavigator} options={{
          tabBarLabel: () => null,  // Hides the label in the tab
          headerShown: false,  // If you want to hide the header too
      }}/>
    </Tab.Navigator>
  )
}
export default MainNavigator;
