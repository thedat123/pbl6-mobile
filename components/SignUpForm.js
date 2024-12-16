import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { API_BASE_URL } from '@env';
import colors from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

const initialState = {
  inputValues: {
    userName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    roles: ["user"], // Default role
  },
  inputValidities: {
    userName: false,
    email: false,
    password: false,
    passwordConfirm: false,
  },
  formIsValid: false,
};

const SignUpForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback((inputId, inputValue) => {
    const result = validateInput(inputId, inputValue);
    dispatchFormState({ inputId, validationResult: result, inputValue });
  }, []);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []); 

  const authHandler = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formState.inputValues.userName,
          name: formState.inputValues.userName,
          email: formState.inputValues.email,
          password: formState.inputValues.password,
          passwordConfirm: formState.inputValues.passwordConfirm,
          roles: formState.inputValues.roles,
        }),
      });

      const result = await response.json();
      console.log("result: " + result);
      if (!response.ok) {
        throw new Error(result.message || 'Sign up failed!');
      }

      await AsyncStorage.setItem('token', result.token);
      navigation.navigate('MainAppNavigator');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  useEffect(() => {
    if (error) {
      Alert.alert('Sign-Up Error', error, [{ text: 'Okay' }]);
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <Input
        id="userName"
        label="Username"
        value={formState.inputValues.userName}
        onInputChanged={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities.userName}
      />
      <Input
        id="email"
        label="Email"
        value={formState.inputValues.email}
        onInputChanged={inputChangedHandler}
        keyboardType="email-address"
        autoCapitalize="none"
        errorText={formState.inputValidities.email}
      />
      <Input
        id="password"
        label="Password"
        secureTextEntry={!isPasswordVisible}
        value={formState.inputValues.password}
        onInputChanged={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities.password}
        icon={isPasswordVisible ? 'eye' : 'eye-off'}
        onIconPress={togglePasswordVisibility}
        iconPack={Ionicons}
      />
      <Input
        id="passwordConfirm"
        label="Confirm Password"
        secureTextEntry={!isPasswordVisible}
        value={formState.inputValues.passwordConfirm}
        onInputChanged={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities.passwordConfirm}
        icon={isPasswordVisible ? 'eye' : 'eye-off'}
        onIconPress={togglePasswordVisibility}
        iconPack={Ionicons}
      />
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity
          style={[styles.signUpButton, !formState.formIsValid && { backgroundColor: colors.grey }]}
          onPress={authHandler}
          disabled={!formState.formIsValid}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  signUpButton: {
    backgroundColor: '#40B671',
    borderRadius: 40,
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    textAlign: 'center',
  },
});

export default SignUpForm;
