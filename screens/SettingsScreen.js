import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
  Modal,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '', // Initialize to the current date
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState({
    uri: 'http://192.168.100.101:8081/assets/images/Settings/default-user-avatar.png',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    showCancel: false,
  });

  const showModal = (config) => {
    setModalConfig({ ...config, visible: true });
  };

  useEffect(() => {
    fetchDataFromToken();
  }, []);

  const fetchDataFromToken = async () => {
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
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        // Update formData with the API response
        setFormData({
          fullName: data.name || '', // Assuming data has name field
          email: data.email || '', // Assuming data has email field
          phone: data.phone || '', // Assuming data has phone field
        });
      }
    } catch (error) {
      console.error('Error fetching user data from API:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (token) {
        const response = await fetch(`http://10.0.2.2:3000/api/v1/resetPassword/${token}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: passwordForm.newPassword,
            passwordConfirm: passwordForm.confirmPassword,
          }),
        });

        console.log('Response:', response);

        if (!response.ok) {
          throw new Error('Failed to updated password');
        }

        const data = await response.json();
        console.log('Password updated successfully:', data);
      }
    } catch (error) {
      console.error('Error updated password:', error);
    }
  }

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showModal({
          title: 'Permission Required',
          message: 'Please enable photo library access in settings',
          type: 'error'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage({ uri: result.assets[0].uri });
      }
    } catch (error) {
      showModal({
        title: 'Error',
        message: 'Failed to select image',
        type: 'error'
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showModal({
        title: 'Success',
        message: 'Changes saved successfully!',
        type: 'success'
      });
    }, 1000);
  };

  const handleLogout = () => {
    showModal({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'danger',
      showCancel: true,
      onConfirm: async () => {
        try {
          await AsyncStorage.removeItem('token');
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainNavigator' }],
          });
        } catch (error) {
          showModal({
            title: 'Error',
            message: 'Failed to logout',
            type: 'error'
          });
        }
      }
    });
  };

  const handleModalClose = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  const renderInputField = (iconName, label, value, onChangeText, inputProps = {}) => (
    <View style={styles.inputContainer}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name={iconName} size={24} color="#666" />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputField}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor="#999"
            {...inputProps}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <View style={styles.header}>
        <Image source={{ uri: 'http://192.168.100.101:8081/assets/images/Settings/backgroundSettings.png' }} style={styles.coverImage} />
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image source={profileImage} style={styles.profileImage} />
            <TouchableOpacity style={styles.editButton} onPress={handleImagePicker}>
              <MaterialIcons name="edit" size={20} color="#4285F4" />
            </TouchableOpacity>
          </View>
        </View>
      </View>


        <View style={styles.tabs}>
          {['Profile', 'Password'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <MaterialIcons
                name={tab === 'Profile' ? 'person' : 'lock'}
                size={24}
                color={activeTab === tab ? '#4285F4' : '#5F6368'}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.formContent}>
          {activeTab === 'Profile' ? (
            <>
              {renderInputField("person", "Full Name", formData.fullName, 
                (text) => setFormData(prev => ({ ...prev, fullName: text })))}
              
              {renderInputField("email", "Email", formData.email, 
                (text) => setFormData(prev => ({ ...prev, email: text })), 
                { keyboardType: 'email-address' })}

              {renderInputField("phone", "Phone", formData.phone, 
                (text) => setFormData(prev => ({ ...prev, phone: text })))}
  
            </>
          ) : (
            <>
              {renderInputField("lock", "New Password", passwordForm.newPassword,
                (text) => setPasswordForm(prev => ({ ...prev, newPassword: text })),
                { secureTextEntry: !showPassword })}

              {renderInputField("lock-outline", "Confirm Password", passwordForm.confirmPassword,
                (text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text })),
                { secureTextEntry: !showConfirmPassword })}
            </>
          )}

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={activeTab === 'Profile' ? handleSave : handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.saveButtonContent}>
                <MaterialIcons name="save" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {activeTab === 'Profile' ? 'Save Changes' : 'Update Password'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#EA4335" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={modalConfig.visible}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, styles[`${modalConfig.type}Header`]]}>
              <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            </View>
            <View style={styles.modalFooter}>
              {modalConfig.showCancel && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]} 
                  onPress={handleModalClose}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]} 
                onPress={() => {
                  handleModalClose();
                  modalConfig.onConfirm();
                }}
              >
                <Text style={styles.modalConfirmText}>
                  {modalConfig.type === 'danger' ? 'Logout' : 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    height: 240,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -60,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
  },
  editButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4285F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 16,
    color: '#5F6368',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4285F4',
  },
  tabText: {
    fontSize: 16,
    color: '#5F6368',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  formContent: {
    padding: 24,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    width: 40,
    alignItems: 'center',
    marginTop: 24,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 14,
    color: '#5F6368',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dateField: {
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  selectedGender: {
    backgroundColor: '#E8F0FE',
    borderColor: '#4285F4',
  },
  genderText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#5F6368',
  },
  selectedGenderText: {
    color: '#4285F4',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#E8EAED',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3F3',
    borderWidth: 1,
    borderColor: '#EA4335',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonText: {
    color: '#EA4335',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
      padding: 20,
      alignItems: 'center',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
  },
  modalHeaderError: {
      backgroundColor: '#EA4335',
  },
  modalHeaderSuccess: {
      backgroundColor: '#34A853',
  },
  modalHeaderDanger: {
      backgroundColor: '#EA4335',
  },
  modalHeaderWarning: {
      backgroundColor: '#FBBC04',
  },
  modalTitle: {
      fontSize: 18,
      color: '#fff',
      fontWeight: '600',
      textAlign: 'center',
  },
  modalBody: {
      padding: 24,
      backgroundColor: '#fff',
  },
  modalMessage: {
      fontSize: 16,
      color: '#1A1A1A',
      textAlign: 'center',
      lineHeight: 24,
  },
  modalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: '#E8EAED',
  },
  modalButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 100,
      alignItems: 'center',
      justifyContent: 'center',
  },
  modalConfirmButton: {
      backgroundColor: '#34A853',
  },
  modalCancelButton: {
      backgroundColor: '#EA4335',
  },
  modalConfirmText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  },
  modalCancelText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  },
});

export default SettingsScreen;