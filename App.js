import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {

  const clickHandler = () => {
    console.log("I was pressed")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hey guys!!</Text>
      <StatusBar style="auto" />


      <Button title="Click me" onPress={clickHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: 'black',
    fontSize: 18
  }
});
