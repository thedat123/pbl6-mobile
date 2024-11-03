import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PageContainer from '../components/PageContainer';

const { width, height } = Dimensions.get('window');

const HomeNavigator = ({ navigation }) => {
    const [currentPage, setCurrentPage] = useState('home');

    const handleGetStarted = () => setCurrentPage('anotherPage');
    const handleLearnMore = () => setCurrentPage('learnMorePage');
    const handleBack = () => {
        if (currentPage === 'learnMorePage') setCurrentPage('anotherPage');
        else if (currentPage === 'anotherPage') setCurrentPage('home');
    };

    const Button = ({ onPress, text, style, primary = true }) => (
        <TouchableOpacity 
            onPress={onPress}
            style={[
                styles.button,
                primary ? styles.primaryButton : styles.secondaryButton,
                style
            ]}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.buttonText,
                primary ? styles.primaryButtonText : styles.secondaryButtonText
            ]}>
                {text}
            </Text>
        </TouchableOpacity>
    );

    const Card = ({ imageUri, description }) => (
        <View style={styles.card}>
            <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.cardGradient}
            >
                <Image
                    style={styles.cardImage}
                    source={{ uri: imageUri }}
                    resizeMode="contain"
                />
                <Text style={styles.cardDescription}>{description}</Text>
            </LinearGradient>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <PageContainer>
                {currentPage === 'home' && (
                    <View style={styles.container}>
                        <View style={styles.imageContainer}>
                            <Image
                                style={styles.logoImage}
                                source={{ uri: 'http://192.168.100.101:8081/assets/images/Home/home_main.png' }}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.contentContainer}>
                            <Text style={styles.heading}>
                                Unlock Your English{'\n'}Potential with Us
                            </Text>
                            <Text style={styles.subHeading}>
                                Welcome to our comprehensive English Learning Platform. 
                                Master vocabulary and ace your TOEIC exam with our 
                                innovative learning tools.
                            </Text>
                            <Button 
                                onPress={handleGetStarted} 
                                text="Get Started" 
                                style={styles.mainButton}
                            />
                        </View>
                    </View>
                )}

                {currentPage === 'anotherPage' && (
                    <ScrollView 
                        contentContainerStyle={styles.anotherPageContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Image
                            style={styles.featureImage}
                            source={{ uri: 'http://192.168.100.101:8081/assets/images/Home/home_vocab.png' }}
                            resizeMode="contain"
                        />
                        <View style={styles.contentContainer}>
                            <Text style={styles.anotherPageTitle}>
                                Master Vocabulary with Interactive Flashcards
                            </Text>
                            <Text style={styles.anotherPageDescription}>
                                Enhance your learning journey with our carefully crafted 
                                flashcard system. Practice, review, and track your progress 
                                as you build your vocabulary foundation.
                            </Text>
                            <View style={styles.buttonGroup}>
                                <Button 
                                    onPress={handleLearnMore} 
                                    text="Learn More"
                                />
                                <Button 
                                    onPress={handleBack} 
                                    text="Back"
                                    primary={false}
                                />
                            </View>
                        </View>
                    </ScrollView>
                )}

                {currentPage === 'learnMorePage' && (
                    <ScrollView 
                        contentContainerStyle={styles.learnMoreContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.learnMoreTitle}>
                            Your Path to TOEIC Success
                        </Text>
                        <View style={styles.cardContainer}>
                            <Card
                                imageUri="http://192.168.100.101:8081/assets/images/Home/card-img.png"
                                description="Practice with Recent TOEIC Tests"
                            />
                            <Card
                                imageUri="http://192.168.100.101:8081/assets/images/Home/card-img_2.png"
                                description="Detailed Score Analysis & Explanations"
                            />
                            <Card
                                imageUri="http://192.168.100.101:8081/assets/images/Home/card-img_3.png"
                                description="Track Your Progress & Improvement"
                            />
                        </View>
                        <View style={styles.buttonGroup}>
                            <Button 
                                onPress={() => navigation.navigate('LogIn')} 
                                text="Start Learning Now"
                            />
                            <Button 
                                onPress={handleBack} 
                                text="Back"
                                primary={false}
                            />
                        </View>
                    </ScrollView>
                )}
            </PageContainer>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.03,
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
    },
    heading: {
        fontSize: width * 0.08,
        fontWeight: '800',
        textAlign: 'center',
        color: '#1a365d',
        marginBottom: height * 0.02,
        lineHeight: width * 0.1,
    },
    subHeading: {
        fontSize: width * 0.04,
        textAlign: 'center',
        color: '#4a5568',
        marginBottom: height * 0.03,
        lineHeight: width * 0.055,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: height * 0.03,
    },
    logoImage: {
        width: width * 0.8,
        height: width * 0.8,
    },
    featureImage: {
        width: width * 0.9,
        height: width * 0.6,
        marginBottom: height * 0.03,
    },
    button: {
        paddingVertical: height * 0.018,
        paddingHorizontal: width * 0.08,
        borderRadius: width * 0.03,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    primaryButton: {
        backgroundColor: '#4299e1',
    },
    secondaryButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#4299e1',
    },
    buttonText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        textAlign: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
    },
    secondaryButtonText: {
        color: '#4299e1',
    },
    mainButton: {
        width: width * 0.6,
    },
    buttonGroup: {
        width: '100%',
        gap: height * 0.02,
        marginTop: height * 0.03,
    },
    anotherPageContainer: {
        alignItems: 'center',
        paddingVertical: height * 0.03,
    },
    anotherPageTitle: {
        fontSize: width * 0.06,
        fontWeight: '700',
        color: '#1a365d',
        marginBottom: height * 0.02,
        textAlign: 'center',
        lineHeight: width * 0.08,
    },
    anotherPageDescription: {
        fontSize: width * 0.04,
        color: '#4a5568',
        textAlign: 'center',
        lineHeight: width * 0.055,
        marginBottom: height * 0.02,
    },
    learnMoreContainer: {
        alignItems: 'center',
        padding: width * 0.05,
    },
    learnMoreTitle: {
        fontSize: width * 0.07,
        fontWeight: '700',
        marginBottom: height * 0.03,
        textAlign: 'center',
        color: '#1a365d',
    },
    cardContainer: {
        width: '100%',
        gap: height * 0.02,
        marginBottom: height * 0.03,
    },
    card: {
        borderRadius: width * 0.04,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    cardGradient: {
        padding: width * 0.05,
        alignItems: 'center',
    },
    cardImage: {
        width: width * 0.25,
        height: width * 0.25,
        marginBottom: height * 0.02,
    },
    cardDescription: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#2d3748',
        textAlign: 'center',
    },
});

export default HomeNavigator;