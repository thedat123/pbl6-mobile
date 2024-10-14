import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { View, ActivityIndicator, Alert, Button, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import Input from '../components/Input';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signUp } from '../utils/actions/authActions';
import colors from '../constants/colors';
import { useDispatch } from 'react-redux';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Determine if it's a small or large device
const isSmallDevice = width < 360;

const initialState = {
    inputValues: {
        userName: "",
        email: "",
        password: "",
    },
    inputValidities: {
        userName: false,
        email: false,
        password: false,
    },
    formIsValid: false
};

const SignUpForm = props => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const dispatch = useDispatch();
    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue });
    }, [dispatchFormState]);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    useEffect(() => {
        if (error) {
            Alert.alert("An error occurred", error, [{ text: "Okay" }]);
        }
    }, [error]);

    const authHandler = useCallback(async () => {
        try {
            setIsLoading(true);
            const action = signUp(
                formState.inputValues.userName,
                formState.inputValues.email,
                formState.inputValues.password
            );
            setError(null);
            await dispatch(action);
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    }, [dispatch, formState]);

    return (
        <>
            <View>  
                <Input
                    id="userName"
                    label="Username"
                    value={formState.inputValues.userName}  // Ensure value is passed
                    onInputChanged={inputChangedHandler}
                    autoCapitalize="none"
                    errorText={formState.inputValidities["userName"]}
                />
                <Input
                    id="email"
                    label="Email"
                    value={formState.inputValues.email}  // Ensure value is passed
                    onInputChanged={inputChangedHandler}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    errorText={formState.inputValidities["email"]}
                />
                <Input
                    id="password"
                    label="Password"
                    secureTextEntry={!isPasswordVisible}
                    onInputChanged={inputChangedHandler}
                    initialValue={formState.inputValues.password}
                    autoCapitalize="none"
                    errorText={formState.inputValidities['password']}
                    icon={isPasswordVisible ? 'eye' : 'eye-off'}
                    onIconPress={togglePasswordVisibility}
                    iconPack={Ionicons}
                />
                {
                    isLoading ? 
                    <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 10 }} /> : (
                        <TouchableOpacity 
                            style={styles.signUpButton} 
                            onPress={authHandler} 
                            disabled={!formState.formIsValid}
                        >
                            <Text style={styles.buttonText}>Sign up</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
        </>
          
    );
};

const styles = StyleSheet.create({
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
        fontSize: isSmallDevice ? 14 : 16, // Responsive font size
        textAlign: 'center',
    },
});

export default SignUpForm;
