import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView, TouchableOpacity, Dimensions, useWindowDimensions, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import Pagination from '../components/Pagination';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { moderateScale } from 'react-native-size-matters';
import { API_BASE_URL } from '@env';

const LEVELS = [
    { id: 'all', label: 'All', color: '#9E9E9E', icon: 'layers', gradient: ['#9E9E9E', '#757575'] },
    { id: 'beginner', label: 'Beginner', color: '#4CAF50', icon: 'smile', gradient: ['#4CAF50', '#388E3C'] },
    { id: 'intermediate', label: 'Intermediate', color: '#FF9800', icon: 'trending-up', gradient: ['#FF9800', '#F57C00'] },
    { id: 'advanced', label: 'Advanced', color: '#F44336', icon: 'star', gradient: ['#F44336', '#D32F2F'] },
  ];  

const ITEMS_PER_PAGE = 4;
const HomePageScreen = () => {
    const { width, height } = useWindowDimensions();
    const [username, setUsername] = useState('');
    const [targetScore, setTargetScore] = useState(0);
    const [testDate, setTestDate] = useState('');
    const [daysUntilExam, setDaysUntilExam] = useState(null);
    const [vocabGroups, setVocabGroups] = useState([]);  // State for vocab groups
    const [isLoading, setLoading] = useState(false);
    const [showAllVocabGroups, setShowAllVocabGroups] = useState(false);
    const [error, setError] = useState(null);
    const isLandscape = width > height;
    const [currentPage, setCurrentPage] = useState(1);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const resultCardWidth = width * (isLandscape ? 0.4 : 0.75);
    const gridColumnWidth = (width - 60) / (isLandscape ? 3 : 2);

    const visibleVocabGroups = showAllVocabGroups ? vocabGroups : vocabGroups.slice(0, 4);
    const [lastPracticeResults, setLastPracticeResults] = useState([]);
    const [recentTests, setRecentTests] = useState([]);
    const [showAllTests, setShowAllTests] = useState(false);
    const [currentPageVocab, setCurrentPageVocab] = useState(1);
    const [currentPageTests, setCurrentPageTests] = useState(1);
    const navigation = useNavigation();

    useEffect(() => {
        const animate = () => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        };

        animate();
        fetchInitialData();
        fetchLastPracticeResults();
        fetchLastRecentTest();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchInitialData();
        }, [targetScore, testDate])
    );

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([fetchUsernameFromToken(), fetchVocabGroups()]);
        } catch (err) {
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!API_BASE_URL) {
            console.error('API_BASE_URL is not defined. Please check your .env configuration.');
            setError('Configuration Error: Unable to connect to server');
            return;
        }
    }, []); 

    useEffect(() => {
        fetchInitialData();
    }, [targetScore]); 

    const fetchLastPracticeResults = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await fetch(`${API_BASE_URL}:3001/api/v1/test-practice/user/lastPractice`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch last practice results');
                }
    
                const data = await response.json();
                const processedData = data.lastPractice.map((practice) => ({
                    id: practice.id,
                    title: practice.test ? practice.test.name : 'Unknown Test',
                    date: new Date(practice.createdAt).toLocaleDateString(),
                    score: practice.LCScore + practice.RCScore,
                }));
    
                console.log(processedData);
                console.log("---------------------");
    
                setLastPracticeResults(processedData);
            }
        } catch (error) {
            console.error('Error fetching last practice results:', error);
            setError('Unable to load practice results.');
        }
    };
    

    const fetchUsernameFromToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await fetch(`${API_BASE_URL}:3001/api/v1/auth/me`, {
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
                setTargetScore(data.targetScore || 0);
                setTestDate(data.testDate?.split('T')[0] || '');
                const savedDays = await AsyncStorage.getItem('daysUntilExam');
                setDaysUntilExam(JSON.parse(savedDays));
            }
        } catch (error) {
            console.error('Error fetching username from API:', error);
        }
    };

    const fetchVocabGroups = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}:3001/api/v1/group-topic/`);
            if (!response.ok) throw new Error('Failed to fetch vocab groups');
            
            const data = await response.json();
            
            const { data: vocabGroupsData } = data;
    
            const processedData = vocabGroupsData.map(group => ({
                id: group.id || '',
                name: group.name || 'Unknown Name',
                level: group.level || 'unknown',
                description: group.description || '',
                thumbnail: group.thumbnail || 'https://via.placeholder.com/150',
                topicsCount: group.topicsCount || 0,
                userCount: group.userCount || 0,
            }));
    
            setVocabGroups(processedData);
            await AsyncStorage.setItem('vocabGroups', JSON.stringify(processedData));
            await AsyncStorage.setItem('lastUpdated', Date.now().toString());
        } catch (error) {
            console.error('Error fetching vocab groups:', error);
            setError('Unable to load vocabulary groups');
        }
    };
    
    

    const fetchLastRecentTest = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await fetch(`${API_BASE_URL}:3001/api/v1/test`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch test data');
                }
    
                const responseData = await response.json();
    
                if (Array.isArray(responseData.data)) {
                    const processedData = responseData.data.map(test => ({
                        id: test.id,
                        title: test.name,
                        date: new Date(test.createdAt).toLocaleDateString(),
                    }));
    
                    setRecentTests(processedData);
                } else {
                    throw new Error('Data format is not as expected');
                }
            }
        } catch (error) {
            console.error('Error fetching practice results:', error);
            setError('Unable to load practice results.');
        }
    };            

    const renderPracticeResult = ({ item }) => (
        <TouchableOpacity style={[styles.resultCard, { width: moderateScale(300) }]}>
        <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.resultGradient}
        >
            <Text style={[styles.resultTitle, { fontSize: moderateScale(16) }]}>{item.title}</Text>
            <View style={styles.resultDetails}>
            <Text style={[styles.resultText, { fontSize: moderateScale(14) }]}>Date Taken: {item.date}</Text>
            <Text style={[styles.resultText, styles.scoreText, { fontSize: moderateScale(16) }]}>Score: {item.score}</Text>
            </View>
        </LinearGradient>
        </TouchableOpacity>
    );

    const renderVocabSet = ({ item }) => {
        if (!item || !item.name) return null;
    
        const levelConfig = LEVELS.find((l) => l.id === item.level) || LEVELS[0];
    
        return (
            <Animated.View 
                key={item.id} 
                style={[styles.vocabCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
            >
                <TouchableOpacity 
                    style={styles.vocabCardInner}
                    onPress={() => navigation.navigate('VocabDetailScreen', { topicId: item.id })}
                >
                    <View style={styles.vocabImageContainer}>
                        <Image 
                            source={{ uri: item.thumbnail }}
                            style={styles.thumbnail}
                            defaultSource={require('../assets/placeholder.png')}
                        />
                        <LinearGradient
                            colors={levelConfig.gradient}
                            style={styles.levelBadge}
                        >
                            <Feather name={levelConfig.icon} size={12} color="white" />
                            <Text style={styles.levelBadgeText}>{levelConfig.label}</Text>
                        </LinearGradient>
                    </View>
    
                    <View style={styles.vocabContent}>
                        <Text style={styles.vocabTitle} numberOfLines={2}>{item.name || 'Unnamed Group'}</Text>
    
                        <View style={styles.vocabStats}>
                            <View style={styles.topicCount}>
                                <Feather name="book" size={14} color="#666" />
                                <Text style={styles.topicCountText}>{item.topicsCount} topics</Text>
                            </View>
    
                            <View style={styles.progressSection}>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBackground}>
                                        <LinearGradient
                                            colors={levelConfig.gradient}
                                            style={[styles.progressFill, { width: `${item.progress || 0}%` }]}
                                        />
                                    </View>
                                    <Text style={styles.progressText}>{`${item.progress || 0}%`}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };
        

    const renderRecentTest = ({ item }) => (
        <TouchableOpacity style={[styles.testCard, { width: gridColumnWidth }]}>
            <View style={[styles.testIconContainer, { width: width * 0.1, height: width * 0.1 }]}>
                <Text style={[styles.testIcon, { fontSize: width * 0.05 }]}>📝</Text>
            </View>
            <Text 
                numberOfLines={2} 
                style={[styles.testTitle, { fontSize: width * 0.035 }]}>
                {item.title}
            </Text>
            <View style={styles.testInfo}>
                <Text style={[styles.testText, { fontSize: width * 0.03 }]}>{item.date}</Text>
            </View>
        </TouchableOpacity>
    );    

    return (
        <FlatList
            data={visibleVocabGroups} 
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
                                    <Text style={[styles.boldText, { fontSize: width * 0.04 }]}>{daysUntilExam}</Text>
                                </View>
                                <View style={[styles.infoCard, { padding: width * 0.03 }]}>
                                    <Text style={[styles.headerSubtext, { fontSize: width * 0.03 }]}>Exam Date</Text>
                                    <Text style={[styles.boldText, { fontSize: width * 0.036 }]}>{testDate}</Text>
                                </View>
                                <View style={[styles.infoCard, { padding: width * 0.03 }]}>
                                    <Text style={[styles.headerSubtext, { fontSize: width * 0.03 }]}>Target Score</Text>
                                    <Text style={[styles.boldText, { fontSize: width * 0.04 }]}>{targetScore}</Text>
                                </View>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontSize: width * 0.05 }]}>Latest Practice Results</Text>
                        </View>
                        <FlatList
                            data={lastPracticeResults}
                            renderItem={renderPracticeResult}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalListContent}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontSize: width * 0.05 }]}>
                                Top Vocabulary Sets
                            </Text>
                            <TouchableOpacity onPress={() => setShowAllVocabGroups(!showAllVocabGroups)}>
                                <Text style={[styles.seeAll, { fontSize: width * 0.035 }]}>
                                    {showAllVocabGroups ? "Show Less" : "See All"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : (
                            <>
                                {showAllVocabGroups ? (
                                    <>
                                        {vocabGroups.length > 0 ? (
                                            <View style={styles.vocabList}>
                                                {vocabGroups
                                                    .slice(
                                                        (currentPageVocab - 1) * ITEMS_PER_PAGE,
                                                        currentPageVocab * ITEMS_PER_PAGE
                                                    )
                                                    .map((item) => renderVocabSet({ item }))}
                                            </View>
                                        ) : (
                                            <Text style={styles.noResultsText}>No vocabulary sets found.</Text>
                                        )}

                                        <View style={styles.paginationContainer}>
                                            <Pagination
                                                currentPage={currentPageVocab}
                                                totalItems={vocabGroups.length}
                                                itemsPerPage={ITEMS_PER_PAGE}
                                                onPageChange={setCurrentPageVocab}
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <FlatList
                                        data={vocabGroups.slice(0, 4)}
                                        renderItem={renderVocabSet}
                                        keyExtractor={(item) => item.id}
                                        contentContainerStyle={styles.vocabList}
                                        showsVerticalScrollIndicator={false}
                                    />
                                )}
                            </>
                        )}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { fontSize: width * 0.05 }]}>Most Recent Tests</Text>
                            <TouchableOpacity onPress={() => setShowAllTests(!showAllTests)}>
                                <Text style={[styles.seeAll, { fontSize: width * 0.035 }]}>
                                    {showAllTests ? "Show Less" : "See All"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showAllTests ? (
                            <>
                                <FlatList
                                    data={recentTests.slice((currentPageTests - 1) * ITEMS_PER_PAGE, currentPageTests * ITEMS_PER_PAGE)}
                                    renderItem={renderRecentTest}
                                    keyExtractor={item => item.id}
                                    numColumns={isLandscape ? 3 : 2}
                                    key={isLandscape ? 'landscape' : 'portrait'}
                                    contentContainerStyle={styles.gridListContent}
                                />
                                <View style={styles.paginationContainer}>
                                    <Pagination
                                        currentPage={currentPageTests}
                                        totalItems={recentTests.length}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                        onPageChange={setCurrentPageTests}
                                    />
                                </View>
                            </>
                        ) : (
                            <FlatList
                                data={recentTests.slice(0, 4)}
                                renderItem={renderRecentTest}
                                keyExtractor={item => item.id}
                                numColumns={isLandscape ? 3 : 2}
                                key={isLandscape ? 'landscape' : 'portrait'}
                                contentContainerStyle={styles.gridListContent}
                            />
                        )}
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
        width: 'auto',
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
        marginLeft: moderateScale(15),
        borderRadius: moderateScale(16),
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      resultGradient: {
        padding: moderateScale(20),
      },
      resultTitle: {
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: moderateScale(12),
      },
      resultDetails: {
        marginTop: moderateScale(8),
      },
      resultText: {
        color: '#ffffff',
        opacity: 0.9,
        marginBottom: moderateScale(4),
      },
      scoreText: {
        fontWeight: '700',
        opacity: 1,
      },
    vocabCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    vocabCardInner: {
        flex: 1,
    },
    vocabImageContainer: {
        position: 'relative',
        aspectRatio: 16/9,
        backgroundColor: '#f0f2f5',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    levelBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    vocabContent: {
        padding: 12,
    },
    vocabTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a237e',
        marginBottom: 8,
        lineHeight: 22,
    },
    vocabStats: {
        gap: 8,
    },
    topicCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    topicCountText: {
        color: '#666',
        fontSize: 14,
    },
    progressSection: {
        marginTop: 4,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBackground: {
        flex: 1,
        height: 4,
        backgroundColor: '#f0f2f5',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        minWidth: 35,
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