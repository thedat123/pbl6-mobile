import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePageScreen = () => {
    // Use useWindowDimensions hook for responsive layout
    const { width, height } = useWindowDimensions();
    const [username, setUsername] = useState('');
    const isLandscape = width > height;

    // Responsive card widths
    const resultCardWidth = width * (isLandscape ? 0.4 : 0.75);
    const gridColumnWidth = (width - 60) / (isLandscape ? 3 : 2);

    useEffect(() => {
        fetchUsernameFromToken();
    }, []);

    const practiceResults = [
        { id: '1', title: '2024 Practice Set TOEIC Test 10', date: '31/08/2024', score: 345 },
        { id: '2', title: '2024 Practice Set TOEIC Test 10', date: '31/08/2024', score: 345 },
        { id: '3', title: '2024 Practice Set TOEIC Test 10', date: '31/08/2024', score: 345 }
    ];

    const vocabSets = [
        { id: '1', title: '400 Words of TOEFL - Intermediate English', time: '21m', users: '23K', imageUrl: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/image.png' } },
        { id: '2', title: '400 Words of TOEFL - Intermediate English', time: '21m', users: '23K', imageUrl: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/date.png' } },
        { id: '3', title: '400 Words of TOEFL - Intermediate English', time: '21m', users: '23K', imageUrl: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/date.png' } },
        { id: '4', title: '400 Words of TOEFL - Intermediate English', time: '21m', users: '23K', imageUrl: { uri: 'http://192.168.100.101:8081/assets/images/Vocab/date.png' } },
    ];    

    const recentTests = [
        { id: '1', title: 'January Reading Practice Test 1', date: '23/01/2023', percentage: '0%' },
        { id: '2', title: 'January Reading Practice Test 1', date: '23/01/2023', percentage: '0%' },
        { id: '3', title: 'January Reading Practice Test 1', date: '23/01/2023', percentage: '0%' },
    ];
    
    const fetchUsernameFromToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await fetch('http://10.0.2.2:3000/api/v1/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,  
                        'Content-Type': 'application/json',   
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch username');
                }
    
                const data = await response.json();
                setUsername(data.name || 'User');
            }
        } catch (error) {
            console.error('Error fetching username from API:', error);
        }
    };          

    const renderPracticeResult = ({ item }) => (
        <TouchableOpacity style={[styles.resultCard, { width: resultCardWidth }]}>
            <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.resultGradient}
            >
                <Text style={[styles.resultTitle, { fontSize: width * 0.04 }]}>{item.title}</Text>
                <View style={styles.resultDetails}>
                    <Text style={[styles.resultText, { fontSize: width * 0.035 }]}>Date Taken: {item.date}</Text>
                    <Text style={[styles.resultText, styles.scoreText, { fontSize: width * 0.045 }]}>Score: {item.score}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const renderVocabSet = ({ item }) => (
        <TouchableOpacity style={[styles.vocabCard, { width: gridColumnWidth }]}>
            <Image 
                source={item.imageUrl} 
                style={[styles.vocabImage, { height: gridColumnWidth * 0.6 }]} 
            />
            <Text 
                numberOfLines={2} 
                style={[styles.vocabTitle, { fontSize: width * 0.035 }]}
            >
                {item.title}
            </Text>
            <View style={styles.vocabStats}>
                <Text style={[styles.vocabText, { fontSize: width * 0.03 }]}>{item.time}</Text>
                <View style={styles.dot} />
                <Text style={[styles.vocabText, { fontSize: width * 0.03 }]}>{item.users} learners</Text>
            </View>
        </TouchableOpacity>
    );

    const renderRecentTest = ({ item }) => (
        <TouchableOpacity style={[styles.testCard, { width: gridColumnWidth }]}>
            <View style={[styles.testIconContainer, { width: width * 0.1, height: width * 0.1 }]}>
                <Text style={[styles.testIcon, { fontSize: width * 0.05 }]}>📝</Text>
            </View>
            <Text 
                numberOfLines={2} 
                style={[styles.testTitle, { fontSize: width * 0.035 }]}
            >
                {item.title}
            </Text>
            <View style={styles.testInfo}>
                <Text style={[styles.testText, { fontSize: width * 0.03 }]}>{item.date}</Text>
                <Text style={[styles.testText, styles.percentageText, { fontSize: width * 0.03 }]}>{item.percentage}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={[]}
            ListHeaderComponent={() => (
                <>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={[styles.header, { paddingTop: height * 0.05 }]}
                    >
                        <SafeAreaView>
                            <Text style={[styles.headerText, { fontSize: width * 0.08 }]}>Hello, {username}! 👋</Text>
                            <View style={[styles.headerInfo, { flexDirection: isLandscape ? 'row' : 'row' }]}>
                                <View style={[styles.infoCard, { padding: width * 0.03 }]}>
                                    <Text style={[styles.headerSubtext, { fontSize: width * 0.03 }]}>Days Until Exam</Text>
                                    <Text style={[styles.boldText, { fontSize: width * 0.04 }]}>111</Text>
                                </View>
                                <View style={[styles.infoCard, { padding: width * 0.03 }]}>
                                    <Text style={[styles.headerSubtext, { fontSize: width * 0.03 }]}>Exam Date</Text>
                                    <Text style={[styles.boldText, { fontSize: width * 0.04 }]}>30/12/2024</Text>
                                </View>
                                <View style={[styles.infoCard, { padding: width * 0.03 }]}>
                                    <Text style={[styles.headerSubtext, { fontSize: width * 0.03 }]}>Target Score</Text>
                                    <Text style={[styles.boldText, { fontSize: width * 0.04 }]}>700</Text>
                                </View>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontSize: width * 0.05 }]}>Latest Practice Results</Text>
                            <TouchableOpacity>
                                <Text style={[styles.seeAll, { fontSize: width * 0.035 }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={practiceResults}
                            renderItem={renderPracticeResult}
                            keyExtractor={item => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalListContent}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontSize: width * 0.05 }]}>Top Vocabulary Sets</Text>
                            <TouchableOpacity>
                                <Text style={[styles.seeAll, { fontSize: width * 0.035 }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={vocabSets}
                            renderItem={renderVocabSet}
                            keyExtractor={item => item.id}
                            numColumns={isLandscape ? 3 : 2}
                            key={isLandscape ? 'landscape' : 'portrait'}
                            contentContainerStyle={styles.gridListContent}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontSize: width * 0.05 }]}>Most Recent Tests</Text>
                            <TouchableOpacity>
                                <Text style={[styles.seeAll, { fontSize: width * 0.035 }]}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={recentTests}
                            renderItem={renderRecentTest}
                            keyExtractor={item => item.id}
                            numColumns={isLandscape ? 3 : 2}
                            key={isLandscape ? 'landscape' : 'portrait'}
                            contentContainerStyle={styles.gridListContent}
                        />
                    </View>
                </>
            )}
            style={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        padding: 20,
        marginBottom: 20,
    },
    headerInfo: {
        justifyContent: 'space-between',
        marginTop: 10,
    },
    infoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    headerSubtext: {
        color: '#ffffff',
        opacity: 0.9,
    },
    boldText: {
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 15,
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontWeight: '700',
        color: '#1a237e',
    },
    seeAll: {
        color: '#5c6bc0',
        fontWeight: '600',
    },
    horizontalListContent: {
        paddingRight: 15,
    },
    gridListContent: {
        paddingHorizontal: 5,
    },
    resultCard: {
        marginLeft: 15,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    resultGradient: {
        padding: 20,
    },
    resultTitle: {
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    resultDetails: {
        marginTop: 8,
    },
    resultText: {
        color: '#ffffff',
        opacity: 0.9,
        marginBottom: 4,
    },
    scoreText: {
        fontWeight: '700',
        opacity: 1,
    },
    vocabCard: {
        backgroundColor: '#ffffff',
        margin: 8,
        borderRadius: 16,
        padding: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    vocabImage: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 12,
    },
    vocabTitle: {
        fontWeight: '600',
        color: '#1a237e',
        marginBottom: 8,
        lineHeight: 20,
    },
    vocabStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vocabText: {
        color: '#5c6bc0',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#5c6bc0',
        marginHorizontal: 6,
    },
    testCard: {
        backgroundColor: '#ffffff',
        margin: 8,
        borderRadius: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    testIconContainer: {
        borderRadius: 20,
        backgroundColor: '#e8eaf6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    testTitle: {
        fontWeight: '600',
        color: '#1a237e',
        marginBottom: 8,
        lineHeight: 20,
    },
    testInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    testText: {
        color: '#5c6bc0',
    },
    percentageText: {
        fontWeight: '700',
    },
});

export default HomePageScreen;