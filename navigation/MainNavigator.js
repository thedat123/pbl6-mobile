import React from "react";
import "react-native-gesture-handler";
import AuthScreen from "../screens/AuthScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeNavigator from "./HomeNavigator";
import { Entypo, Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{
      headerShadowVisible: false,
      headerTitleAlign: 'center',  
    }}>
      <Tab.Screen name="Homepage" component={HomeNavigator} options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),  
      }}/>
      <Tab.Screen name="LogIn" component={AuthScreen} options={{
          headerShown: false,  
          tabBarIcon: ({ color, size }) => (
            <Entypo name="login" size={size} color={color} />
          ),
      }}/>
    </Tab.Navigator>
  )
}
export default MainNavigator;
