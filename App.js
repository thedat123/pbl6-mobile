import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {

  const [count, setCount] = useState(0);

  const add = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  }

  const minus = () => {
    setCount(count - 1)
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView>

        <Button title="Add" onPress={add} />        
        <Text style={styles.label}>{ count }</Text>

        <Button title="Minus" onPress={minus} />
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
