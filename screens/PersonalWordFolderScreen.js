import React, { useEffect, useState } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 4;

const PersonalWorldFolderScreen = ({ navigation }) => {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editedFolderName, setEditedFolderName] = useState('');
  const [editedFolderDescription, setEditedFolderDescription] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const loadFolderData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folder data');
      }

      const data = await response.json();
      const updatedFolders = data.map(folder => ({
        ...folder,
        wordCount: folder.words?.length || 0,
      }));

      setFolders(updatedFolders);
    } catch (error) {
      showAlert('Error', 'Unable to load folders. Please try again.', 'error');
      console.error('Error fetching folder data:', error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      const newFolder = {
        name: newFolderName.trim(),
        description: newFolderDescription.trim() || null,
      };
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newFolder),
        });
  
        if (!response.ok) {
          throw new Error('Failed to create folder.');
        }
  
        const data = await response.json();
        setFolders([
          ...folders,
          { id: data.id, name: newFolderName, description: newFolderDescription, wordCount: 0 },
        ]);
        setNewFolderName('');
        setNewFolderDescription('');
        setCreateFolderModalVisible(false);
      } catch (error) {
        console.error('Error creating folder:', error.message);
        showAlert('Error', 'Failed to create folder. Please try again.', 'error');
      }
    } else {
      showAlert('Error', 'Please enter a folder name.', 'error');
    }
  };

  useEffect(() => {
    loadFolderData();
  }, []);

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setEditedFolderName(folder.name);
    setEditedFolderDescription(folder.description || '');
    setEditModalVisible(true);
  };

  const AlertModal = () => (
    <Modal
      transparent
      visible={modal.visible}
      animationType="fade"
      onRequestClose={() => setModal(prev => ({ ...prev, visible: false }))}
    >
      <View style={styles.alertModal_overlay}>
        <View style={styles.alertModal_container}>
          <View style={[styles.alertModal_header, styles[`alertModal_header${modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}`]]}>
            <Text style={styles.alertModal_title}>{modal.title}</Text>
          </View>
          <View style={styles.alertModal_body}>
            <Text style={styles.alertModal_message}>{modal.message}</Text>
          </View>
          <View style={styles.alertModal_footer}>
            {modal.showCancel && (
              <TouchableOpacity 
                style={[styles.alertModal_button, styles.alertModal_cancelButton]}
                onPress={() => setModal(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.alertModal_buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.alertModal_button, styles.alertModal_confirmButton]}
              onPress={() => {
                setModal(prev => ({ ...prev, visible: false }));
                modal.onConfirm();
              }}
            >
              <Text style={styles.alertModal_buttonText}>
                {modal.type === 'danger' ? 'Logout' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );  

  const [modal, setModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
        showCancel: false,
  });

  const showAlert = (title, message, type, showCancel = false, onConfirm = () => {}) => {
    setModal({ visible: true, title, message, type, showCancel, onConfirm });
  };

  const handleSaveFolderEdit = async () => {
    if (editedFolderName.trim() && editingFolder) {
      const updatedFolder = {
        ...editingFolder,
        name: editedFolderName.trim(),
        description: editedFolderDescription.trim() || null,
      };

      const token = await AsyncStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic/${editingFolder.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFolder),
        });

        if (!response.ok) {
          throw new Error('Failed to update folder');
        }

        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === editingFolder.id ? updatedFolder : folder
          )
        );

        setEditModalVisible(false);
        setEditingFolder(null);
        showAlert('Success', 'Folder updated successfully', 'success');
      } catch (error) {
        console.error('Error updating folder:', error.message);
        showAlert('Error', 'Failed to update folder. Please try again.', 'error');
      }
    } else {
      showAlert('Error', 'Please enter a valid folder name.', 'error');
    }
  };

  const confirmDelete = (folder) => {
    setFolderToDelete(folder);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;

    const token = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}:3001/api/v1/user-topic/${folderToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      setFolders(folders.filter(folder => folder.id !== folderToDelete.id));
      setDeleteConfirmVisible(false);
      setFolderToDelete(null);
      showAlert('Success', 'Folder deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting folder:', error.message);
      showAlert('Error', 'Failed to delete folder. Please try again.', 'error');
    }
  };

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Folder</Text>
            <TouchableOpacity 
              onPress={() => setEditModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Folder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter folder name"
            value={editedFolderName}
            onChangeText={setEditedFolderName}
            placeholderTextColor="#999"
          />
          
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter folder description"
            value={editedFolderDescription}
            onChangeText={setEditedFolderDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleSaveFolderEdit}
            >
              <Text style={styles.createButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDeleteConfirmModal = () => (
    <Modal
      visible={deleteConfirmVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setDeleteConfirmVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.deleteModalContent]}>
          <View style={styles.deleteIconContainer}>
            <Ionicons name="warning" size={48} color="#FF6B6B" />
          </View>
          <Text style={styles.deleteModalTitle}>Delete Folder</Text>
          <Text style={styles.deleteModalMessage}>
            Are you sure you want to delete "{folderToDelete?.name}"? This action cannot be undone.
          </Text>
          <View style={styles.deleteModalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelDeleteButton]}
              onPress={() => setDeleteConfirmVisible(false)}
            >
              <Text style={styles.cancelDeleteButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmDeleteButton]}
              onPress={handleDeleteFolder}
            >
              <Text style={styles.confirmDeleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  

  const navigateToFolder = (folder) => {
    navigation.navigate('FolderWordDetail', { folder });
  };

  const handleCreateNewFolder = () => {
    setCreateFolderModalVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFolderData();
  };

  const renderCreateFolderModal = () => (
    <Modal
      visible={createFolderModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setCreateFolderModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Folder</Text>
            <TouchableOpacity 
              onPress={() => setCreateFolderModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Folder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter folder name"
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholderTextColor="#999"
          />
          
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter folder description"
            value={newFolderDescription}
            onChangeText={setNewFolderDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setCreateFolderModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreateFolder}
            >
              <Text style={styles.createButtonText}>Create Folder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderFolderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.folderContainer} 
      onPress={() => navigateToFolder(item)}
      activeOpacity={0.7}
    >
      <View style={styles.folderContent}>
        <View style={styles.folderIconContainer}>
          <Ionicons name="folder" size={32} color="#4A90E2" />
        </View>
        <View style={styles.folderTextContainer}>
          <Text style={styles.folderName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.folderDescription} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>
          <View style={styles.wordCountContainer}>
            <Ionicons name="book-outline" size={14} color="#4A90E2" />
            <Text style={styles.folderWordCount}>
              {item.wordCount} {item.wordCount === 1 ? 'word' : 'words'}
            </Text>
          </View>
        </View>
        <View style={styles.folderActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEditFolder(item)}
          >
            <Ionicons name="pencil" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => confirmDelete(item)}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const paginatedFolders = folders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading && folders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Pin Word</Text>
        <Text style={styles.headerDescription}>
          Create, pin, and learn English vocabulary
        </Text>
      </View>
  
      {folders.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconContainer}>
            <Ionicons name="folder-open" size={80} color="#E0E0E0" />
          </View>
          <Text style={styles.emptyStateTitle}>No folders yet</Text>
          <Text style={styles.emptyStateDescription}>
            Create your first folder to start organizing your vocabulary
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton} 
            onPress={handleCreateNewFolder}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.emptyStateButtonText}>Create First Folder</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedFolders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFolderItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#4A90E2']} 
                tintColor="#4A90E2" 
              />
            }
            ListFooterComponent={() => (
              <View>
                <Pagination
                  currentPage={currentPage}
                  totalItems={folders.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
                <TouchableOpacity 
                  style={styles.newFolderButton} 
                  onPress={handleCreateNewFolder}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle" size={24} color="#4A90E2" />
                  <Text style={styles.newFolderButtonText}>Create New Folder</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      )}
  
      {renderCreateFolderModal()}
      {renderEditModal()}
      {renderDeleteConfirmModal()}
      <AlertModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  listContainer: {
    paddingTop: 15,
    paddingBottom: 20,
  },
  folderContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  folderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  folderIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  folderTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  folderDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 6,
    lineHeight: 20,
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderWordCount: {
    fontSize: 13,
    color: '#4A90E2',
    marginLeft: 4,
  },
  chevronContainer: {
    padding: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIconContainer: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  newFolderButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  newFolderButtonText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  folderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingRight: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteModalContent: {
    alignItems: 'center',
    padding: 24,
  },
  deleteIconContainer: {
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  deleteModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelDeleteButton: {
    backgroundColor: '#F0F0F0',
    flex: 1,
    marginRight: 8,
  },
  confirmDeleteButton: {
    backgroundColor: '#FF6B6B',
    flex: 1,
    marginLeft: 8,
  },
  cancelDeleteButtonText: {
    color: '#666',
  },
  confirmDeleteButtonText: {
    color: 'white',
  },
  alertModal_overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  alertModal_container: {
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
  alertModal_header: {
    padding: 20,
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  alertModal_headerError: {
    backgroundColor: '#EA4335',
  },
  alertModal_headerSuccess: {
    backgroundColor: '#34A853',
  },
  alertModal_headerDanger: {
    backgroundColor: '#EA4335',
  },
  alertModal_headerWarning: {
    backgroundColor: '#FBBC04',
  },
  alertModal_title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  alertModal_body: {
    padding: 24,
    backgroundColor: '#fff',
  },
  alertModal_message: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 24,
  },
  alertModal_footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  alertModal_button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertModal_confirmButton: {
    backgroundColor: '#34A853',
  },
  alertModal_cancelButton: {
    backgroundColor: '#EA4335',
  },
  alertModal_buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
  

export default PersonalWorldFolderScreen;