import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import HomeVocabScreen from "../screens/Home_VocabScreen";
import TestScreen from "../screens/TestScreen";
import { AntDesign, Ionicons } from "@expo/vector-icons";

const Stack = createBottomTabNavigator();
const MainAppNavigator = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="HomePage"
          component={HomeScreen}
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
                    <AntDesign name="book" size={24} color="black" />
          )}}
        />
        <Stack.Screen
          name="Test"
          component={TestScreen}
          options={{ headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="API" size={24} color="black" />
            ),
           }}
        />
        <Stack.Screen
          name="Settings"
          component={TestScreen}
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