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
import { Order, User, OrderStatus } from '../types';
import orderService from '../services/orderService';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'analytics'>('orders');
  const [userSortBy, setUserSortBy] = useState<'all' | 'customers' | 'drivers'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all orders
      const allOrdersData = await orderService.getAllOrders();
      console.log('🔍 AdminDashboard: All orders fetched:', allOrdersData.length, 'orders');
      console.log('🔍 AdminDashboard: Order statuses:', allOrdersData.map(o => ({ id: o.id?.slice(-8), status: o.status, driver: o.driver })));
      setAllOrders(allOrdersData);
      
      // Filter to show only active orders (not completed or cancelled)
      const activeOrders = allOrdersData.filter(order => 
        order.status !== 'DELIVERED' && 
        order.status !== 'CANCELLED'
      );
      
      console.log('🔍 AdminDashboard: Active orders:', activeOrders.length, 'orders');
      console.log('🔍 AdminDashboard: Active order details:', activeOrders.map(o => ({ id: o.id?.slice(-8), status: o.status, driver: o.driver })));
      setOrders(activeOrders);

      // Load real users from authService (exclude archived users and admin users)
      const allUsers = await authService.getAllUsers();
      const activeUsers = allUsers.filter(user => 
        !user.isArchived && 
        user.userType !== 'admin' // Hide admin users from management
      );
      setUsers(activeUsers);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#ffa726';
      case 'ASSIGNED':
        return '#42a5f5';
      case 'PICKED_UP':
        return '#26a69a';
      case 'IN_TRANSIT':
        return '#ff7043';
      case 'DELIVERED':
        return '#66bb6a';
      case 'CANCELLED':
        return '#ef5350';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ASSIGNED':
        return 'Assigned';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemId}>Order #{(item.id || item._id || '').slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Customer:</Text> {item.customerId}
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Driver:</Text> {item.driverId || 'Unassigned'}
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>From:</Text> {
            typeof item.pickupAddress === 'string' 
              ? item.pickupAddress 
              : `${item.pickupAddress?.street || ''}, ${item.pickupAddress?.city || ''}, ${item.pickupAddress?.state || ''} ${item.pickupAddress?.zipCode || ''}`
          }
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>To:</Text> {
            typeof item.deliveryAddress === 'string' 
              ? item.deliveryAddress 
              : `${item.deliveryAddress?.street || ''}, ${item.deliveryAddress?.city || ''}, ${item.deliveryAddress?.state || ''} ${item.deliveryAddress?.zipCode || ''}`
          }
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text> ${item.price.total.toFixed(2)}
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text> {formatDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const handleApproveDriver = async (userId: string) => {
    console.log('Approve Driver button clicked for user:', userId);
    try {
      console.log('Calling authService.approveDriver...');
      await authService.approveDriver(userId);
      console.log('Driver approved successfully');
      Alert.alert('Success', 'Driver has been approved');
      loadData(); // Refresh the data
    } catch (error) {
      console.error('Error approving driver:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to approve driver');
    }
  };


  const handleArchiveUser = async (userId: string, userEmail: string) => {
    console.log('🔍 ARCHIVE: Button clicked for user:', userId, 'email:', userEmail);
    
    // Use platform-appropriate confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to archive ${userEmail}? They will be moved to archived users.`);
      if (confirmed) {
        await performArchive(userId);
      } else {
        console.log('🔍 ARCHIVE: User cancelled archive');
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Archive User',
        `Are you sure you want to archive ${userEmail}? They will be moved to archived users.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('🔍 ARCHIVE: User cancelled archive')
          },
          {
            text: 'Archive',
            style: 'destructive',
            onPress: () => performArchive(userId),
          },
        ]
      );
    }
  };

  const performArchive = async (userId: string) => {
    console.log('🔍 ARCHIVE: User confirmed archive, calling authService.archiveUser...');
    try {
      const result = await authService.archiveUser(userId);
      console.log('🔍 ARCHIVE: authService.archiveUser result:', result);
      
      if (Platform.OS === 'web') {
        alert('Success: User has been archived');
      } else {
        Alert.alert('Success', 'User has been archived');
      }
      
      loadData(); // Refresh the data
    } catch (error) {
      console.log('🔍 ARCHIVE: Error occurred:', error);
      
      if (Platform.OS === 'web') {
        alert('Error: ' + (error instanceof Error ? error.message : 'Failed to archive user'));
      } else {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to archive user');
      }
    }
  };

  const getFilteredUsers = () => {
    console.log('Current userSortBy:', userSortBy);
    console.log('Total users:', users.length);
    console.log('All users:', users.map(u => ({ name: u.firstName + ' ' + u.lastName, type: u.userType, isApproved: u.isApproved })));
    
    if (userSortBy === 'customers') {
      const filtered = users.filter(u => u.userType === 'customer');
      console.log('Filtered customers:', filtered.length);
      return filtered;
    } else if (userSortBy === 'drivers') {
      const filtered = users.filter(u => u.userType === 'driver');
      console.log('Filtered drivers:', filtered.length);
      return filtered;
    }
    console.log('Showing all users:', users.length);
    return users; // Show all users (customers and drivers)
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
          <Text style={styles.detailLabel}>Joined:</Text> {formatDate(item.createdAt)}
        </Text>
      </View>

      {/* Driver Approval Button */}
      {item.userType === 'driver' && !item.isApproved && (
        <View style={styles.approvalButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApproveDriver(item.id)}
          >
            <Text style={styles.approveButtonText}>✓ Approve Driver</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Archive User Button (for all users) */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleArchiveUser(item.id, item.email)}
        >
          <Text style={styles.deleteButtonText}>🗃️ Archive User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalytics = () => {
    // Analytics based on completed orders (archive data)
    const completedOrders = allOrders.filter(o => o.status === 'DELIVERED');
    const cancelledOrders = allOrders.filter(o => o.status === 'CANCELLED');
    const totalCompleted = completedOrders.length;
    const totalCancelled = cancelledOrders.length;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.price.total, 0);
    const totalCustomers = users.filter(u => u.userType === 'customer').length;
    const totalDrivers = users.filter(u => u.userType === 'driver').length;

    return (
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{totalCompleted}</Text>
            <Text style={styles.analyticsLabel}>Completed</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{totalCancelled}</Text>
            <Text style={styles.analyticsLabel}>Cancelled</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>{orders.length}</Text>
            <Text style={styles.analyticsLabel}>Active Orders</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsNumber}>${totalRevenue.toFixed(2)}</Text>
            <Text style={styles.analyticsLabel}>Total Revenue</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>
        {activeTab === 'orders' ? '📦' : activeTab === 'users' ? '👥' : '📊'}
      </Text>
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'orders' ? 'No Orders' : activeTab === 'users' ? 'No Users' : 'No Analytics'}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'orders' 
          ? 'No orders found in the system.'
          : activeTab === 'users'
          ? 'No users found in the system.'
          : 'No analytics data available.'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>System Management</Text>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            📦 Orders ({orders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            👥 Users ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            📊 Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'analytics' ? (
        renderAnalytics()
      ) : activeTab === 'orders' ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id || item._id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.usersContainer}>
          {/* User Sorting Controls */}
          <View style={styles.sortContainer}>
            <Text style={styles.sortTitle}>Filter Users:</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity
                style={[styles.sortButton, userSortBy === 'all' && styles.activeSortButton]}
                onPress={() => setUserSortBy('all')}
              >
                <Text style={[styles.sortButtonText, userSortBy === 'all' && styles.activeSortButtonText]}>
                  All ({users.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, userSortBy === 'customers' && styles.activeSortButton]}
                onPress={() => setUserSortBy('customers')}
              >
                <Text style={[styles.sortButtonText, userSortBy === 'customers' && styles.activeSortButtonText]}>
                  Customers ({users.filter(u => u.userType === 'customer').length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, userSortBy === 'drivers' && styles.activeSortButton]}
                onPress={() => setUserSortBy('drivers')}
              >
                <Text style={[styles.sortButtonText, userSortBy === 'drivers' && styles.activeSortButtonText]}>
                  Drivers ({users.filter(u => u.userType === 'driver').length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={getFilteredUsers()}
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
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 4,
    margin: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00d4aa',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.7,
  },
  activeTabText: {
    color: '#1a1a2e',
    opacity: 1,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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
  analyticsContainer: {
    padding: 20,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  analyticsCard: {
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 5,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
  },
  usersContainer: {
    flex: 1,
  },
  sortContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  sortTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeSortButton: {
    backgroundColor: '#00d4aa',
  },
  sortButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSortButtonText: {
    color: '#1a1a2e',
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  approveButton: {
    backgroundColor: '#66bb6a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#ef5350',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButtonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ef5350',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
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

export default AdminDashboardScreen;
