import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeVocabScreen from "../screens/Home_VocabScreen";
import TestScreen from "../screens/TestScreen";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import HomePageScreen from "../screens/HomePageScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ListenTest from "../screens/ListenTest";


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
          name="ListenTest"
          component={ListenTest}
          options={{ headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="customerservice" size={size} color={color} />
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