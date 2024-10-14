import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import PageContainer from '../components/PageContainer'; // Assuming you have a custom PageContainer component
import logo from '../assets/images/Home/home_main.png';
import home_vocab from '../assets/images/Home/home_vocab.png';
import card_image from '../assets/images/Home/card-img.png';
import card_image2 from '../assets/images/Home/card-img_2.png';
import card_image3 from '../assets/images/Home/card-img_3.png';

const HomeNavigator = ({ navigation }) => {
    const [currentPage, setCurrentPage] = useState('home'); // Track current page

    const handleGetStarted = () => setCurrentPage('anotherPage');
    const handleLearnMore = () => setCurrentPage('learnMorePage');
    const handleBackToHome = () => setCurrentPage('home');

    return (
        <SafeAreaView style={styles.safeArea}>
            <PageContainer>
                {currentPage === 'home' && (
                    <View style={styles.container}>
                        <View style={styles.imageContainer}>
                            <Image
                                style={styles.logoImage}
                                source={logo}
                                resizeMode="contain"
                            />
                        </View>
                        <View>
                            <Text style={styles.heading}>Unlock Your English Potential with Us</Text>
                            <Text style={styles.subHeading}>
                                Welcome to our English Learning Website. Explore our features and enhance your vocabulary and TOEIC skills.
                            </Text>
                            <TouchableOpacity style={styles.button} onPress={handleGetStarted} accessibilityLabel="Explore our features">
                                <Text style={styles.buttonText}>Explore</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {currentPage === 'anotherPage' && (
                    <ScrollView contentContainerStyle={styles.anotherPageContainer}>
                        <View style={styles.imageContainer}>
                            <Image
                                style={styles.image}
                                source={home_vocab}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.anotherPageTitle}>Expand Your Vocabulary with Flashcards and Images</Text>
                        <Text style={styles.anotherPageDescription}>
                            Enhance your vocabulary learning experience with our interactive flashcards.
                        </Text>
                        <TouchableOpacity style={styles.backButton} onPress={handleLearnMore} accessibilityLabel="Learn more about vocabulary expansion">
                            <Text style={styles.buttonText}>Learn More</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome} accessibilityLabel="Back to home">
                            <Text style={styles.buttonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}

                {currentPage === 'learnMorePage' && (
                    <ScrollView contentContainerStyle={styles.learnMoreContainer}>
                        <Text style={styles.learnMoreTitle}>Master Every Aspect of the TOEIC Exam</Text>
                        <View style={styles.cardContainer}>
                            <View style={styles.card}>
                                <Image
                                    style={styles.cardImage}
                                    source={card_image}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardDescription}>Take Recent Actual TOEIC Tests</Text>
                            </View>
                            <View style={styles.card}>
                                <Image
                                    style={styles.cardImage}
                                    source={card_image2}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardDescription}>View TOEIC Score and Answer Explanations</Text>
                            </View>
                            <View style={styles.card}>
                                <Image
                                    style={styles.cardImage}
                                    source={card_image3}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardDescription}>Increase Your TOEIC Band Score</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Auth')} accessibilityLabel="Start practicing now">
                            <Text style={styles.buttonText}>Start Practicing Now</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </PageContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        marginVertical: 20,
    },
    heading: {
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#203A90',
        marginBottom: 20,
    },
    subHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#54565A',
        marginBottom: 20,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoImage: {
        width: 400,
        height: 400,
    },
    button: {
        backgroundColor: '#40B671',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    anotherPageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    anotherPageTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#203A90',
        marginVertical: 10,
        textAlign: 'center',
    },
    anotherPageDescription: {
        fontSize: 17,
        color: '#54565A',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#203A90',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        marginTop: 20,
    },
    learnMoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    learnMoreTitle: {
        fontSize: 30,
        marginBottom: 20,
        textAlign: 'center',
        color: '#203A90',
    },
    cardContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        paddingBottom: 20,
    },
    card: {
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        width: '90%',
    },
    cardImage: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    cardDescription: {
        fontSize: 16,
        color: '#54565A',
        textAlign: 'center',
    }
});

export default HomeNavigator;
