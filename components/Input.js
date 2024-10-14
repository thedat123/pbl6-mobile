import React from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import colors from "../constants/colors";

const Input = (props) => {
  const onChangeText = (text) => {
    props.onInputChanged(props.id, text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          {...props}
          style={styles.input}
          onChangeText={onChangeText}
          value={props.value}
          secureTextEntry={props.secureTextEntry}
        />

        {props.icon && (
          <TouchableOpacity onPress={props.onIconPress}>
            <props.iconPack
              name={props.icon}
              size={props.iconSize || 18}
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>

      {props.errorText && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.errorText[0]}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    marginBottom: 6,
    fontFamily: 'bold',
    fontSize: 16,
    color: colors.textColor,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: colors.nearlyWhite,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey,
  },
  icon: {
    marginLeft: 10,
    color: colors.grey,
  },
  input: {
    flex: 1,
    color: colors.textColor,
    fontFamily: 'regular',
    fontSize: 15,
  },
  errorContainer: {
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    fontFamily: 'regular',
  },
});

export default Input;
