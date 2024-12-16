import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import axios from 'axios';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
};

const loadNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem('notificationSettings');
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('Failed to load notification settings:', error);
    return null;
  }
};

const ScheduleScreen = () => {
  const [examDate, setExamDate] = useState(new Date());
  const [targetScore, setTargetScore] = useState('');
  const [daysUntilExam, setDaysUntilExam] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("Don't forget to study!");
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [reminderMode, setReminderMode] = useState('daily'); 
  const [dailyTime, setDailyTime] = useState(new Date());
  const [weeklyDay, setWeeklyDay] = useState(0); 
  const [weeklyTime, setWeeklyTime] = useState(new Date());
  const [specificDate, setSpecificDate] = useState(new Date());
  const [specificTime, setSpecificTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimePickerMode, setCurrentTimePickerMode] = useState('');
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    showCancel: false,
  });
  useEffect(() => {
    requestNotificationPermission();
    calculateDaysUntilExam();
    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => {
      responseListener.remove();
    };
  }, [examDate]);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);  

  useEffect(() => {
    const saveDaysUntilExam = async () => {
      try {
        await AsyncStorage.setItem('daysUntilExam', JSON.stringify(daysUntilExam));
        console.log('Days until exam saved:', daysUntilExam);
      } catch (error) {
        console.error('Failed to save daysUntilExam:', error);
      }
    };
  
    if (daysUntilExam !== null) {
      saveDaysUntilExam();
    }
  }, [daysUntilExam]);
  
  useEffect(() => {
    const loadDaysUntilExam = async () => {
      try {
        const savedDays = await AsyncStorage.getItem('daysUntilExam');
        if (savedDays !== null) {
          setDaysUntilExam(JSON.parse(savedDays));
        }
      } catch (error) {
        console.error('Failed to load daysUntilExam:', error);
      }
    };
  
    loadDaysUntilExam();
  }, []);
  

  useEffect(() => {
    const initializeSettings = async () => {
      const savedSettings = await loadNotificationSettings();
      if (savedSettings) {
        setIsNotificationEnabled(savedSettings.isNotificationEnabled);
        setReminderMode(savedSettings.reminderMode);
        setDailyTime(new Date(savedSettings.dailyTime));
        setWeeklyDay(savedSettings.weeklyDay);
        setWeeklyTime(new Date(savedSettings.weeklyTime));
        setSpecificDate(new Date(savedSettings.specificDate));
        setSpecificTime(new Date(savedSettings.specificTime));
        setNotificationMessage(savedSettings.notificationMessage);
      }
    };
  
    initializeSettings();
  }, []);
  
  useEffect(() => {
    const currentSettings = {
      isNotificationEnabled,
      reminderMode,
      dailyTime,
      weeklyDay,
      weeklyTime,
      specificDate,
      specificTime,
      notificationMessage,
    };
    saveNotificationSettings(currentSettings);
  }, [
    isNotificationEnabled,
    reminderMode,
    dailyTime,
    weeklyDay,
    weeklyTime,
    specificDate,
    specificTime,
    notificationMessage,
  ]);  

  const calculateDaysUntilExam = () => {
    const today = new Date();
    const timeDiff = examDate - today;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setDaysUntilExam(days);
  };

  const showAlert = (title, message, type) => {
    setModal({
      visible: true,
      title,
      message,
      type,
      showCancel: false,
      onConfirm: () => setModal({ ...modal, visible: false }), // Close the modal
    });
  };

  const updateProfile = async (targetScore, testDate) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(token);
      if (!token) {
        Alert.alert('Error', 'You need to be logged in to update your profile.');
        return;
      }
  
      // Ensure testDate is a Date object and convert to ISO string
      const formattedTestDate = testDate instanceof Date ? testDate.toISOString() : new Date(testDate).toISOString();
  
      const response = await axios.patch(`${API_BASE_URL}:3001/api/v1/users/updateProfile`, {
        targetScore: targetScore,
        testDate: formattedTestDate,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Profile updated successfully:', response.data);
      showAlert(
        'Success',
        'Your target score and exam date have been updated successfully!',
        'success'
      );
    } catch (error) {
      if (error.response) {
        // Server responded with a non-2xx status
        console.error('Failed to update profile:', error.response.data);
        showAlert(
          'Error',
          `Failed to update profile: ${error.response.data.message || 'Unknown error'}`,
          'error'
        );
      } else if (error.request) {
        // No response was received from the server
        console.error('No response from server:', error.request);
        showAlert(
          'Error',
          'No response from the server. Please check your network connection.',
          'error'
        );
      } else {
        // Something else went wrong
        console.error('Error updating profile:', error.message);
        showAlert(
          'Error',
          'An error occurred while updating your profile. Please try again.',
          'error'
        );
      }
    }
  };    

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications to receive study reminders',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Error requesting notification permission:', error);
    }
  };

  const handleNotificationResponse = (response) => {
    const { notification } = response;
    const { title, body } = notification.request.content;
    Alert.alert('Notification Tapped', `Title: ${title}\nMessage: ${body}`);
  };

  const scheduleNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
  
      if (!isNotificationEnabled) {
        Alert.alert('Reminder Disabled', 'You have disabled the reminders.');
        return;
      }
  
      let trigger;
  
      switch (reminderMode) {
        case 'daily': {
          const now = new Date();
          const dailyTriggerTime = new Date();
          dailyTriggerTime.setHours(dailyTime.getHours());
          dailyTriggerTime.setMinutes(dailyTime.getMinutes());
          dailyTriggerTime.setSeconds(0);
  
          if (dailyTriggerTime <= now) {
            dailyTriggerTime.setDate(dailyTriggerTime.getDate() + 1);
          }
  
          trigger = dailyTriggerTime;
          break;
        }
  
        case 'weekly': {
          const now = new Date();
          const weeklyTriggerTime = new Date();
          weeklyTriggerTime.setHours(weeklyTime.getHours());
          weeklyTriggerTime.setMinutes(weeklyTime.getMinutes());
          weeklyTriggerTime.setSeconds(0);
          const daysUntilNextTrigger =
            (7 - now.getDay() + weeklyDay) % 7 || 7; // ||7 đảm bảo không đặt lại trong cùng ngày
          weeklyTriggerTime.setDate(now.getDate() + daysUntilNextTrigger);
  
          trigger = weeklyTriggerTime; // Sử dụng thời gian chính xác cho trigger
          break;
        }
  
        case 'specific': {
          const now = new Date();
          const specificTriggerTime = new Date(specificDate);
          specificTriggerTime.setHours(specificTime.getHours());
          specificTriggerTime.setMinutes(specificTime.getMinutes());
          specificTriggerTime.setSeconds(0);
  
          // Nếu thời gian cụ thể đã qua, báo lỗi
          if (specificTriggerTime <= now) {
            Alert.alert(
              'Invalid Time',
              'The specific reminder must be set for a future date and time.'
            );
            return;
          }
  
          trigger = specificTriggerTime;
          break;
        }
  
        default:
          Alert.alert('Error', 'Invalid reminder mode selected.');
          return;
      }
  
      // Schedule the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎯 TOEIC Study Reminder",
          body: `${daysUntilExam} days until your exam! ${notificationMessage}`,
          sound: true,
        },
        trigger, // Đặt trigger chính xác
      });
  
      Alert.alert(
        'Success',
        `${reminderMode.charAt(0).toUpperCase() + reminderMode.slice(1)} reminder has been scheduled!`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notifications');
      console.error(error);
    }
  };  

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExamDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      switch (currentTimePickerMode) {
        case 'daily':
          setDailyTime(selectedTime);
          break;
        case 'weekly':
          setWeeklyTime(selectedTime);
          break;
        case 'specific':
          setSpecificTime(selectedTime);
          break;
      }
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const showTimePickerForMode = (mode) => {
    setCurrentTimePickerMode(mode);
    setShowTimePicker(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="school" size={40} color="#4A90E2" />
        <Text style={styles.headerTitle}>TOEIC Study Planner</Text>
      </View>

      {/* Exam Date and Countdown Section */}
      <View style={styles.card}>
        {daysUntilExam !== null && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>Time Until Exam</Text>
            <Text style={styles.countdownNumber}>
              {daysUntilExam !== null ? daysUntilExam : ''}
            </Text>

            <Text style={styles.countdownUnit}>days</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${Math.min(100, (30 - daysUntilExam) / 30 * 100)}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Exam Date</Text>
          </View>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(examDate)}</Text>
            <MaterialIcons name="edit" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="score" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Set Target Score</Text>
          </View>

          <TextInput
            style={styles.inputField}
            value={targetScore}
            onChangeText={setTargetScore}
            keyboardType="numeric"
            placeholder="Enter your target score"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => updateProfile(targetScore, examDate)}
          >
            <Text style={styles.saveButtonText}>Save Target Score</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="notifications" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Reminder Settings</Text>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Reminders</Text>
            <TouchableOpacity
              style={styles.switch}
              onPress={() => setIsNotificationEnabled(!isNotificationEnabled)}
            >
              <View style={[styles.switchTrack, isNotificationEnabled && styles.switchTrackEnabled]}>
                <View style={[styles.switchThumb, isNotificationEnabled && styles.switchThumbEnabled]} />
              </View>
            </TouchableOpacity>
          </View>

          {isNotificationEnabled && (
            <>
              <View style={styles.reminderTypeContainer}>
                {['daily', 'weekly', 'specific'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.reminderTypeButton,
                      reminderMode === mode && styles.reminderTypeButtonSelected
                    ]}
                    onPress={() => setReminderMode(mode)}
                  >
                    <Text style={[
                      styles.reminderTypeText,
                      reminderMode === mode && styles.reminderTypeTextSelected
                    ]}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Daily Reminder Settings */}
              {reminderMode === 'daily' && (
                <View style={styles.reminderSettings}>
                  <Text style={styles.settingsLabel}>Daily Reminder Time</Text>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => showTimePickerForMode('daily')}
                  >
                    <Text style={styles.timeButtonText}>{formatTime(dailyTime)}</Text>
                    <MaterialIcons name="access-time" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Weekly Reminder Settings */}
              {reminderMode === 'weekly' && (
                <View style={styles.reminderSettings}>
                  <Text style={styles.settingsLabel}>Weekly Reminder Day & Time</Text>
                  <View style={styles.weekdayContainer}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekdayButton,
                          weeklyDay === index && styles.weekdayButtonSelected,
                        ]}
                        onPress={() => setWeeklyDay(index)}
                      >
                        <Text style={[
                          styles.weekdayText,
                          weeklyDay === index && styles.weekdayTextSelected,
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => showTimePickerForMode('weekly')}
                  >
                    <Text style={styles.timeButtonText}>{formatTime(weeklyTime)}</Text>
                    <MaterialIcons name="access-time" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Specific Date Reminder Settings */}
              {reminderMode === 'specific' && (
                <View style={styles.reminderSettings}>
                  <Text style={styles.settingsLabel}>Specific Date & Time</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>{formatDate(specificDate)}</Text>
                    <MaterialIcons name="event" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => showTimePickerForMode('specific')}
                  >
                    <Text style={styles.timeButtonText}>{formatTime(specificTime)}</Text>
                    <MaterialIcons name="access-time" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              )}

              <TextInput
                style={styles.messageInput}
                value={notificationMessage}
                onChangeText={setNotificationMessage}
                placeholder="Enter reminder message"
                multiline
              />

              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={scheduleNotifications}
              >
                <Text style={styles.scheduleButtonText}>Schedule Reminder</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={examDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={
            currentTimePickerMode === 'daily' ? dailyTime :
            currentTimePickerMode === 'weekly' ? weeklyTime :
            specificTime
          }
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#4A90E2',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownLabel: {
    fontSize: 16,
    color: '#666',
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  countdownUnit: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F6FA',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  switch: {
    padding: 5,
  },
  switchTrack: {
    width: 50,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 14,
    padding: 2,
  },
  switchTrackEnabled: {
    backgroundColor: '#4A90E2',
  },
  switchThumb: {
    width: 24,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbEnabled: {
    transform: [{ translateX: 22 }],
  },
  reminderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  reminderTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  reminderTypeButtonSelected: {
    backgroundColor: '#4A90E2',
  },
  reminderTypeText: {
    fontSize: 14,
    color: '#666',
  },
  reminderTypeTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  reminderSettings: {
    backgroundColor: '#F5F6FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  weekdayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  weekdayButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    minWidth: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekdayButtonSelected: {
    backgroundColor: '#4A90E2',
  },
  weekdayText: {
    fontSize: 12,
    color: '#666',
  },
  weekdayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scheduleButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScheduleScreen;