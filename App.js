import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView>

        <Text style={styles.label}>Hi everyone!</Text>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    color: 'black',
    fontSize: 18
  }
});
