import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Show max 5 page numbers with current page in the middle when possible
  const getPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, 5];
      } else if (currentPage >= totalPages - 2) {
        pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
      }
    }
    return pages;
  };

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity 
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FontAwesome5 name="chevron-left" size={16} color={currentPage === 1 ? '#ccc' : '#007AFF'} />
      </TouchableOpacity>

      <View style={styles.pageNumbersContainer}>
        {getPageNumbers().map(page => (
          <TouchableOpacity
            key={page}
            onPress={() => onPageChange(page)}
          >
            <LinearGradient
              colors={currentPage === page ? ['#1E90FF', '#00BFFF'] : ['#ffffff', '#f8f9fa']}
              style={[styles.pageButton, currentPage === page && styles.activePageButton]}
            >
              <Text style={[styles.pageText, currentPage === page && styles.activePageText]}>
                {page}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FontAwesome5 name="chevron-right" size={16} color={currentPage === totalPages ? '#ccc' : '#007AFF'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pageButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activePageButton: {
    elevation: 2,
  },
  pageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activePageText: {
    color: '#fff',
  },
  navButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
});

export default Pagination;