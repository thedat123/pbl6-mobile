import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reducer } from '../utils/reducers/formReducer';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import * as Google from 'expo-auth-session/providers/google';
import colors from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import Input from './Input'; // Import your Input component
import { validateInput } from '../utils/actions/formActions';
import * as AuthSession from 'expo-auth-session';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

const initialState = {
  inputValues: {
    username: '',
    password: '',
  },
  inputValidities: {
    username: false,
    password: false,
  },
  formIsValid: false,
};

const SignInForm = (props) => {
  const [isEnablePass, setIsEnablePass] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const navigation = useNavigation();
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '143329823343-dreg2jdisir6cc2h0ja30i9fjlgvbncd.apps.googleusercontent.com',
    androidClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
    iosClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri,
    responseType: 'token', // Switch to token response type
  });  

  const inputChangedHandler = useCallback((inputId, inputValue) => {
    const result = validateInput(inputId, inputValue);
    dispatchFormState({
      inputId,
      validationResult: result,
      inputValue,
    });
  }, []);

  useEffect(() => {
    console.log('Google Auth Request:', request);
    console.log('Google Auth Response:', response);
  
    if (response?.type === 'success') {
      console.log('Google Auth Success:', response.params);
      getGoogleUser(response.params.access_token);
    } else if (response?.type === 'error') {
      console.error('Google Auth Error:', response.error);
    }
  }, [response]);  

  useEffect(() => {
    if (error) {
      Alert.alert('An error occurred', error, [{ text: 'Okay' }]);
    }
  }, [error]);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []); 

  useEffect(() => {
    console.log(response);
    if (response?.type === 'success') {
      const exchangeTokens = async () => {
        try {
          const { code } = response.params;
          const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
              code,
              client_id: 'GOOGLE_GUID.apps.googleusercontent.com',
              client_secret: 'YOUR_CLIENT_SECRET',
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }
          );
          console.log('Token Response:', tokenResponse.data);
          // Save token and navigate
          await AsyncStorage.setItem('token', tokenResponse.data.access_token);
          navigation.navigate('MainAppNavigator');
        } catch (error) {
          console.error('Token Exchange Error:', error);
        }
      };
      exchangeTokens();
    } else if (response?.type === 'error') {
      console.error('Google Auth Error:', response.error);
    }
  }, [response]);
  

  const getGoogleUser = async (accessToken) => {
    try {
      console.log(accessToken);
      const gUserReq = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(gUserReq.data);
      await AsyncStorage.setItem('token', accessToken);
      navigation.navigate('MainAppNavigator');
    } catch (error) {
      console.log('GoogleUserReq error: ', error);
      setError(error.message);
    }
  };

  const authHandler = useCallback(async () => {
    setIsLoading(true);
    console.log('Form State Before Submission:', formState);
  
    const baseURL = Platform.OS === 'ios' ? 'http://localhost:3001/api/v1/auth/login' : `${API_BASE_URL}:3001/api/v1/auth/login`;
    try {
      const response = await fetch(baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formState.inputValues.username,
          password: formState.inputValues.password,
        }),
      });
  
      const result = await response.json();
      console.log('Login Response:', result);
  
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong!');
      }
  
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('userId', result.user.id);
      navigation.navigate('MainAppNavigator');
    } catch (error) {
      console.error('Login Error:', error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [formState]);
  

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const enableRememberPassword = () => {
    setIsEnablePass((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Existing Username and Password Inputs */}
      <Input
        id="username"
        label="Username"
        value={formState.inputValues.username}
        onInputChanged={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities.username}
      />
      <Input
        id="password"
        label="Password"
        autoCapitalize="none"
        secureTextEntry={!isPasswordVisible}
        onInputChanged={inputChangedHandler}
        value={formState.inputValues.password}
        errorText={formState.inputValidities.password}
        icon={isPasswordVisible ? 'eye' : 'eye-off'}
        iconPack={Ionicons}
        onIconPress={togglePasswordVisibility}
      />

      {/* Remember Me & Forgot Password */}
      <View style={styles.rememberParent}>
        <View style={styles.rememberZone}>
          <TouchableOpacity onPress={enableRememberPassword}>
            {isEnablePass ? (
              <Feather name="check-square" size={24} color="black" />
            ) : (
              <Feather name="square" size={24} color="black" />
            )}
          </TouchableOpacity>
          <Text>Remember me</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.subText}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={authHandler}
          disabled={!formState.formIsValid}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      )}

      {/* Google Login Button */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => promptAsync()} // Triggers Google sign-in flow
      >
        <Ionicons name="logo-google" size={24} color="white" />
        <Text style={styles.socialText}>Login with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loginButton: {
    backgroundColor: '#40B671',
    borderRadius: 40,
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  rememberParent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberZone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    textAlign: 'center',
  },
  socialContainer: {
    marginTop: 20,
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4', // Google color
    borderRadius: 40,
    height: 50,
    marginBottom: 10,
  },
  socialText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: isSmallDevice ? 14 : 16,
  },
  subText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default SignInForm;