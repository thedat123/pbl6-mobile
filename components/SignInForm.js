import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Input from '../components/Input';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signIn } from '../utils/actions/authActions';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import colors from '../constants/colors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

const initialState = {
  inputValues: {
    username: '',  // userName instead of email
    password: '',
  },
  inputValidities: {
    username: false,  // userName instead of email
    password: false,
  },
  formIsValid: false,
};


const SignInForm = (props) => {
  const [isEnablePass, setIsEnablePass] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback((inputId, inputValue) => {
    const result = validateInput(inputId, inputValue);
    dispatchFormState({
      inputId,
      validationResult: result,
      inputValue,
    });
  }, []);
  

  useEffect(() => {
    if (error) {
      Alert.alert("An error occurred", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
  setIsLoading(true);

  const baseURL =
    Platform.OS === 'ios'
      ? 'http://localhost:3000/api/v1/auth/login'  // iOS Emulator
      : 'http://10.0.2.2:3000/api/v1/auth/login';  // Android Emulator

    try {
      const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formState.inputValues.username,
          password: formState.inputValues.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong!');
      }

      // Lưu token vào AsyncStorage nếu đăng nhập thành công
      await AsyncStorage.setItem('token', result.token);
      console.log('Token:', result.token);
      setError(null);
      navigation.navigate('MainAppNavigator');
    } catch (error) {
      console.error('Error:', error.message);
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
    <View>
      <Input
        id="username"  // id should be userName
        label="Username"
        value={formState.inputValues.userName}  // Bind to userName
        onInputChanged={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities.userName}  // Update validity check for userName
      />

      <Input
        id="password"
        label="Password"
        autoCapitalize="none"
        secureTextEntry={!isPasswordVisible}
        onInputChanged={inputChangedHandler}
        value={formState.inputValues.password}  // Bind to password
        errorText={formState.inputValidities.password}
        icon={isPasswordVisible ? 'eye' : 'eye-off'}
        iconPack={Ionicons}
        onIconPress={togglePasswordVisibility}
      />

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

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={authHandler}
          disabled={!formState.formIsValid}  // Button is enabled only when formIsValid is true
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default SignInForm;
