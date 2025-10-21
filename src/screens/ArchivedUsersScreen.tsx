import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { User } from '../types';
import authService from '../services/authService';

const ArchivedUsersScreen: React.FC = () => {
  const [archivedUsers, setArchivedUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadArchivedUsers();
  }, []);

  const loadArchivedUsers = async () => {
    try {
      const users = await authService.getArchivedUsers();
      setArchivedUsers(users);
    } catch (error) {
      console.error('Error loading archived users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArchivedUsers();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUnarchiveUser = async (userId: string, userEmail: string) => {
    // Use platform-appropriate confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to restore ${userEmail}?`);
      if (confirmed) {
        await performUnarchive(userId);
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Unarchive User',
        `Are you sure you want to restore ${userEmail}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Restore',
            onPress: () => performUnarchive(userId),
          },
        ]
      );
    }
  };

  const performUnarchive = async (userId: string) => {
    try {
      await authService.unarchiveUser(userId);
      
      if (Platform.OS === 'web') {
        alert('Success: User has been restored');
      } else {
        Alert.alert('Success', 'User has been restored');
      }
      
      loadArchivedUsers(); // Refresh the list
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Error: ' + (error instanceof Error ? error.message : 'Failed to restore user'));
      } else {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to restore user');
      }
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemId}>{item.firstName} {item.lastName}</Text>
        <View style={[styles.userTypeBadge, { backgroundColor: item.userType === 'driver' ? '#42a5f5' : '#66bb6a' }]}>
          <Text style={styles.userTypeText}>{item.userType.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text> {item.email}
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text> {item.phone}
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address:</Text> {item.address}
        </Text>
        {item.userType === 'driver' && (
          <View style={styles.statusRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: item.isApproved ? '#66bb6a' : '#ffa726',
              marginLeft: 8
            }]}>
              <Text style={styles.statusText}>
                {item.isApproved ? 'APPROVED' : 'PENDING'}
              </Text>
            </View>
          </View>
        )}
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Archived:</Text> {formatDate(item.updatedAt)}
        </Text>
      </View>

      {/* Restore Button */}
      <View style={styles.restoreButtonContainer}>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => handleUnarchiveUser(item.id, item.email)}
        >
          <Text style={styles.restoreButtonText}>🔄 Restore User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📁</Text>
      <Text style={styles.emptyStateTitle}>No Archived Users</Text>
      <Text style={styles.emptyStateText}>
        No users have been archived yet.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Archived Users</Text>
        <Text style={styles.subtitle}>Rejected drivers and blocked customers</Text>
      </View>

      <FlatList
        data={archivedUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  itemCard: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  userTypeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    fontSize: 14,
    color: '#ffffff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  restoreButtonContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  restoreButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#1a1a2e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ArchivedUsersScreen;
