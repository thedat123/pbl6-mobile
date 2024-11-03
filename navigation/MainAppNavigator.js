import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import HomeVocabScreen from "../screens/Home_VocabScreen";
import TestScreen from "../screens/TestScreen";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import VocabResultScreen from "../screens/VocabResultScreen";
import HomeNavigator from "./HomeNavigator";
import HomePageScreen from "../screens/HomePageScreen";
import TestPart1 from "../screens/TestPart1";
import { Settings } from "react-native";
import SettingsScreen from "../screens/SettingsScreen";
import TestSubject from "../screens/TestSubject";
import TestPart5 from "../screens/TestPart5";
import TestBase from "../components/TestBase";
import PracticeMode from "../components/PracticeMode";
import FullMode from "../components/FullMode";
import Comment from "../components/Comment";
import ResultTestPageScreen from "../screens/ResultTestPageScreen";

const Stack = createBottomTabNavigator();
const MainAppNavigator = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="HomePage"
          component={HomePageScreen}
          options={{ headerShown: false,
                      tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                      ),
           }}
        />
        <Stack.Screen
          name="Vocabulary"
          component={HomeVocabScreen}
          options={{ headerShown: false, tabBarIcon: ({ color, size }) => (
                    <AntDesign name="book" size={size} color={color} />
          )}}
        />
        <Stack.Screen
          name="Test"
          component={TestScreen}
          options={{ headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="API" size={size} color={color} />
            ),
           }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false,
                      tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                      ),
           }} 
        />
    </Stack.Navigator>
    )
};

export default MainAppNavigator;