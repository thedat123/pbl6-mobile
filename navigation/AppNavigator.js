import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainAppNavigator from "./MainAppNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = (props) => {
  return (
    <NavigationContainer>
      <MainAppNavigator />
    </NavigationContainer>
  );
};
      {/* <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{ headerShown: false }}  // Hide header if using a TabNavigator inside MainNavigator
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}  // Adjust according to your needs
          />
      </Stack.Navigator> */}

export default AppNavigator;
