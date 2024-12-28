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
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Input from '../components/Input';
import { API_BASE_URL } from '@env';

const DEFAULT_AVATAR = require('../assets/images/Settings/default-user-avatar.png');

const SettingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: DEFAULT_AVATAR,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    showCancel: false,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (!API_BASE_URL) {
        console.error('API_BASE_URL is not defined. Please check your .env configuration.');
        setError('Configuration Error: Unable to connect to server');
        return;
    }
  }, []);   

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log(token);
      if (!token) return;
  
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch user data');
  
      const data = await response.json();
      const avatarUri = data.avatar || DEFAULT_AVATAR;
  
      setFormData({
        fullName: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        avatar: avatarUri,
      });
  
      setProfileImage(typeof avatarUri === 'string' && avatarUri !== '' ? { uri: avatarUri } : DEFAULT_AVATAR);
    } catch (error) {
      showAlert('Error', 'Failed to load user data', 'error');
    }
  };

  const updatePassword = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}:3001/api/v1/auth/updatePassword`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.newPassword,
          passwordConfirm: passwordForm.confirmPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to update password');

      showAlert('Success', 'Password updated successfully', 'success');
    } catch (error) {
      showAlert('Error', 'Failed to update password', 'error');
    }
  };

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No authentication token');
  
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      const updateFields = {};
      if (formData.fullName && formData.fullName !== '' && formData.fullName !== data?.name) {
        updateFields.name = formData.fullName;
      }
      if (formData.email && formData.email !== '' && formData.email !== data?.email) {
        updateFields.email = formData.email;
      }
      if (formData.phone && formData.phone !== '' && formData.phone !== data?.phone) {
        updateFields.phone = formData.phone;
      }
  
      if (formData.avatar) {
        if (formData.avatar.includes('res.cloudinary.com')) {
          const publicIdMatch = formData.avatar.match(/\/v\d+\/([^.]+)\./);
          if (publicIdMatch && publicIdMatch[1]) {
            if (formData.avatar !== data.avatar) {
              updateFields.avatar = await convertToBase64(formData.avatar);
            }
          } else {
            console.error('Could not extract public ID from Cloudinary URL');
          }
        } 
        else if (formData.avatar.startsWith('file://') || formData.avatar.startsWith('data:')) {
          try {
            const base64Image = formData.avatar.startsWith('file://') 
              ? await convertToBase64(formData.avatar) 
              : formData.avatar;
            
            if (base64Image !== data.avatar) {
              updateFields.avatar = base64Image;
            }
          } catch (conversionError) {
            showAlert('Error', 'Failed to process avatar image', 'error');
            setIsLoading(false);
            return;
          }
        }
      }
  
      if (Object.keys(updateFields).length === 0) {
        showAlert('No Changes', 'No changes were made to your profile.', 'info');
        setIsLoading(false);
        return;
      }
  
      const updateResponse = await fetch(`${API_BASE_URL}:3001/api/v1/users/updateProfile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateFields),
      });
  
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Error details:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }
  
      const updatedData = await updateResponse.json();
      setFormData({
        fullName: updatedData.name || formData.fullName,
        email: updatedData.email || formData.email,
        phone: updatedData.phone || formData.phone,
        avatar: updatedData.avatar || formData.avatar,
      });
      setProfileImage({ uri: updatedData.avatar || formData.avatar });
      showAlert('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      console.error('Update Profile Error:', error);
      showAlert('Error', error.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };        
    
  const showAlert = (title, message, type, showCancel = false, onConfirm = () => {}) => {
    setModal({ visible: true, title, message, type, showCancel, onConfirm });
  };

  const handleImagePicker = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        showAlert('Permission Required', 'Please enable photo library access', 'error');
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
      showAlert('Error', 'Failed to select image', 'error');
    }
  };

  const convertToBase64 = async (imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  const handleProfileImageChange = async (newImageUri) => {
    try {
      if (typeof newImageUri === 'string' && newImageUri !== '') {
        // If it's an HTTP URL, just set it directly
        if (newImageUri.startsWith('http')) {
          setProfileImage({ uri: newImageUri });
          setFormData((prevData) => ({
            ...prevData,
            avatar: newImageUri,
          }));
        } 
        // If it's a local file, convert to Base64
        else if (newImageUri.startsWith('file://')) {
          const base64Image = await convertToBase64(newImageUri);
          setProfileImage({ uri: base64Image });
          setFormData((prevData) => ({
            ...prevData,
            avatar: base64Image,
          }));
        }
      } else {
        setProfileImage(DEFAULT_AVATAR);
        setFormData((prevData) => ({
          ...prevData,
          avatar: DEFAULT_AVATAR,
        }));
      }
    } catch (error) {
      showAlert('Error', 'Failed to convert image to Base64', 'error');
    }
  };

  const handleLogout = () => {
    showAlert(
      'Logout',
      'Are you sure you want to logout?',
      'danger',
      true,
      async () => {
        try {
          await AsyncStorage.removeItem('token');
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainNavigator' }],
          });
        } catch (error) {
          showAlert('Error', 'Failed to logout', 'error');
        }
      }
    );
  };

  const StatButton = ({ icon, title, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statButton, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statButtonContent}>
        <View style={styles.statButtonIcon}>
          {icon}
        </View>
        <View style={styles.statButtonTextContainer}>
          <Text style={styles.statButtonText}>{title}</Text>
          <MaterialIcons name="chevron-right" size={24} color="#FFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const AlertModal = () => (
    <Modal
      transparent
      visible={modal.visible}
      animationType="fade"
      onRequestClose={() => setModal(prev => ({ ...prev, visible: false }))}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[styles.modalHeader, styles[`${modal.type}Header`]]}>
            <Text style={styles.modalTitle}>{modal.title}</Text>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{modal.message}</Text>
          </View>
          <View style={styles.modalFooter}>
            {modal.showCancel && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModal(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={() => {
                setModal(prev => ({ ...prev, visible: false }));
                modal.onConfirm();
              }}
            >
              <Text style={styles.modalButtonText}>
                {modal.type === 'danger' ? 'Logout' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

        return (
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            enableOnAndroid={true}
            extraHeight={120}
          >
          <SafeAreaView style={styles.container}>
            <ScrollView>
              <View style={styles.header}>
                <Image 
                  source={require('../assets/images/Settings/backgroundSettings.png')} 
                  style={styles.coverImage} 
                />
                
                <View style={styles.profileSection}>
                  <View style={styles.profileImageContainer}>
                    <Image source={profileImage} style={styles.profileImage} />
                    <TouchableOpacity style={styles.editButton} onPress={handleImagePicker}>
                      <MaterialIcons name="edit" size={20} color="#4285F4" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.statButtonsContainer}>
                  <StatButton
                    icon={<MaterialIcons name="analytics" size={28} color="#FFF" />}
                    title="Learning Statistics"
                    color="#4A90E2"
                    onPress={() => navigation.navigate('ResultStatisticScreen')}
                  />
                  <StatButton
                    icon={<FontAwesome name="calendar" size={28} color="#FFF" />}
                    title="My Schedule"
                    color="#34A853"
                    onPress={() => navigation.navigate('ScheduleScreen')}
                  />
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
            <Input
              icon="person"  // Use the name of the icon
              iconPack= {MaterialIcons}  // Add the icon pack
              label="Full Name"
              value={formData.fullName}
              onInputChanged={(id, text) => setFormData(prev => ({ ...prev, fullName: text }))}
            />
            <Input
              icon="email"
              iconPack={MaterialIcons}
              label="Email"
              value={formData.email}
              onInputChanged={(id, text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
            />
            <Input
              icon="phone"
              iconPack={MaterialIcons}
              label="Phone"
              value={formData.phone}
              onInputChanged={(id, text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </>
        ) : (
          <>
            <Input
              icon="lock"
              iconPack={MaterialIcons}
              label="Current Password"
              value={passwordForm.currentPassword}
              onInputChanged={(id, text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
              secureTextEntry
            />
            <Input
              icon="lock-outline"
              iconPack={MaterialIcons}
              label="New Password"
              value={passwordForm.newPassword}
              onInputChanged={(id, text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
              secureTextEntry
            />
            <Input
              icon="lock-outline"
              iconPack={MaterialIcons}
              label="Confirm Password"
              value={passwordForm.confirmPassword}
              onInputChanged={(id, text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={activeTab === 'Profile' ? updateProfile : updatePassword} // Use updateProfile for Profile tab
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

      <AlertModal />
    </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    height: 420,
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
  // Modal Styles
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
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Stat Button Styles
  statButtonsContainer: {
    padding: 16,
    gap: 8,
  },
  statButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 8,
  },
  statButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statButtonTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});

export default SettingsScreen;