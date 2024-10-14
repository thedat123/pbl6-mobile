import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Input from '../components/Input';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signIn } from '../utils/actions/authActions';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import colors from '../constants/colors';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

const initialState = {
  inputValues: {
    email: '',
    password: '',
  },
  inputValidities: {
    email: false,
    password: false,
  },
  formIsValid: false,
};

const SignInForm = (props) => {
  const [isEnablePass, setIsEnablePass] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const dispatch = useDispatch();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback((inputId, inputValue) => {
    const result = validateInput(inputId, inputValue);
    dispatchFormState({ inputId, validationResult: result, inputValue });
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("An error occurred", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
    setIsLoading(true);
    try {
      const action = signIn(formState.inputValues.email, formState.inputValues.password);
      setError(null);
      await dispatch(action);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, formState]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const enableRememberPassword = () => {
    setIsEnablePass((prev) => !prev);
  };

  return (
    <View>
      <Input
        id="email"
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onInputChanged={inputChangedHandler}
        initialValue={formState.inputValues.email}
        errorText={formState.inputValidities['email']}
      />

      <Input
        id="password"
        label="Password"
        autoCapitalize="none"
        secureTextEntry={!isPasswordVisible}
        onInputChanged={inputChangedHandler}
        initialValue={formState.inputValues.password}
        errorText={formState.inputValidities['password']}
        icon={isPasswordVisible ? 'eye' : 'eye-off'}
        iconPack={Ionicons}
        onIconPress={togglePasswordVisibility}  // Add toggle function
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
          disabled={!formState.formIsValid}
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
