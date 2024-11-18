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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ScheduleScreen = () => {
  const [examDate, setExamDate] = useState(new Date());
  const [daysUntilExam, setDaysUntilExam] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("Don't forget to study!");

  useEffect(() => {
    requestNotificationPermission();
    calculateDaysUntilExam();
    // Add listener for notification response
    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => {
      responseListener.remove();
    };
  }, [examDate]);

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

  const calculateDaysUntilExam = () => {
    const today = new Date();
    const timeDiff = examDate - today;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setDaysUntilExam(days);
  };

  const scheduleDailyNotification = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (isNotificationEnabled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🎯 TOEIC Study Reminder",
            body: `${daysUntilExam} days until your exam! ${notificationMessage}`,
            sound: true,
          },
          trigger: {
            hour: notificationTime.getHours(),
            minute: notificationTime.getMinutes(),
            repeats: true,
          },
        });
        Alert.alert('Success', 'Daily reminder has been scheduled!');
      } else {
        Alert.alert('Reminder Disabled', 'You have disabled the daily reminder.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const confirmSettings = () => {
    Alert.alert(
      'Confirm Settings',
      `Exam Date: ${formatDate(examDate)}\nNotification Time: ${formatTime(notificationTime)}\nMessage: ${notificationMessage}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: scheduleDailyNotification },
      ]
    );
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
      setNotificationTime(selectedTime);
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

  const resetSettings = () => {
    setExamDate(new Date());
    setNotificationTime(new Date());
    setIsNotificationEnabled(false);
    setNotificationMessage("Don't forget to study!");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>TOEIC Exam Scheduler</Text>

        {/* Exam Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exam Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="event" size={24} color="#4A90E2" />
            <Text style={styles.dateButtonText}>{formatDate(examDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Countdown Section */}
        {daysUntilExam !== null && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownNumber}>{daysUntilExam}</Text>
            <Text style={styles.countdownLabel}>Days until exam</Text>
          </View>
        )}

        {/* Notification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminder</Text>
          <TouchableOpacity
            style={styles.switch}
            onPress={() => {
              setIsNotificationEnabled(!isNotificationEnabled);
              if (!isNotificationEnabled) {
                setShowTimePicker(true);
              }
            }}
          >
            <View style={[styles.switchTrack, isNotificationEnabled && styles.switchTrackEnabled]}>
              <View style={[styles.switchThumb, isNotificationEnabled && styles.switchThumbEnabled]} />
            </View>
            <Text style={styles.switchLabel}>
              {isNotificationEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </TouchableOpacity>

          {isNotificationEnabled && (
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <MaterialIcons name="access-time" size={24} color="#4A90E2" />
              <Text style={styles.timeButtonText}>{formatTime(notificationTime)}</Text>
            </TouchableOpacity>
          )}

          {isNotificationEnabled && (
            <TextInput
              style={styles.input}
              placeholder="Custom Reminder Message"
              value={notificationMessage}
              onChangeText={setNotificationMessage}
            />
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={confirmSettings}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetSettings}
        >
          <Text style={styles.resetButtonText}>Reset Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={examDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={notificationTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A4A4A',
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
  },
  countdownNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  countdownLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8EAED',
    padding: 2,
  },
  switchTrackEnabled: {
    backgroundColor: '#4A90E2',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  switchThumbEnabled: {
    transform: [{ translateX: 22 }],
  },
  switchLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4A4A4A',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginTop: 8,
  },
  timeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A4A4A',
  },
  input: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
    fontSize: 16,
    color: '#4A4A4A',
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: '#E8EAED',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#4A90E2',
  },
});

export default ScheduleScreen;
