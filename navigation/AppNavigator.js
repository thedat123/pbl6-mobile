import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import MainAppRoute from "../route/MainAppRoute";
import MainNavigator from "./MainNavigator";

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <MainAppRoute />
    </NavigationContainer>
  );
};

export default AppNavigator;
