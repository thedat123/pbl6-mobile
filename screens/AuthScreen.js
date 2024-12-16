import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PageContainer from '../components/PageContainer';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';

// Get device dimensions
const { width } = Dimensions.get('window');

// Determine if it's a small or large device
const isSmallDevice = width < 360;

const AuthScreen = props => {
    const [isSignUp, setIsSignUp] = useState(false);

    const switchFormHandler = () => {
        setIsSignUp(prevState => !prevState);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <PageContainer>
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoidingView}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        keyboardVerticalOffset={100}
                    >
                        {/* <View style={styles.imageContainer}>
                            <Image
                                style={styles.image}
                                source={logo}
                                resizeMode="contain"
                            />
                        </View> */}

                        <View style={styles.container}>
                            <Text style={styles.mainSlogan}>Welcome to EngFlash!</Text>

                            <View style={styles.switchButton}>
                                <TouchableOpacity
                                    style={isSignUp ? styles.buttonWithoutStyle : styles.buttonWithStyle}
                                    onPress={switchFormHandler}
                                >
                                    <Text style={styles.buttonText}>Login</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={isSignUp ? styles.buttonWithStyle : styles.buttonWithoutStyle}
                                    onPress={switchFormHandler}
                                >
                                    <Text style={styles.buttonText}>Register</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.subText}>
                                {isSignUp ? 'Create an account to start learning with us.' : 'Login to continue your learning journey.'}
                            </Text>
                        </View>

                        {isSignUp ? <SignUpForm /> : <SignInForm />}

                    </KeyboardAvoidingView>
                </ScrollView>
            </PageContainer>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white', 
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: isSmallDevice ? '70%' : '50%',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.01,  
        marginBottom: 20,
        marginTop: 30,
    },
    switchButton: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: '#203A9073',
        height: 50,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    mainSlogan: {
        fontSize: isSmallDevice ? 24 : 30,  
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#203A90',
    },
    buttonWithStyle: {
        backgroundColor: '#203A90',
        borderRadius: 30,
        width: '45%',
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonWithoutStyle: {
        backgroundColor: 'transparent',
        borderRadius: 30,
        width: '45%',
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#203A90',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: isSmallDevice ? 14 : 16,  // Responsive font size
        textAlign: 'center',
    },
    subText: {
        fontSize: isSmallDevice ? 12 : 14,  // Smaller font for small devices
        color: '#203A90',
        textAlign: 'center',
    },
});

export default AuthScreen;
