import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Order, OrderStatus } from '../types';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

const DriverDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'my-orders'>('available');

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      if (!user?.id && !user?._id) {
        setAvailableOrders([]);
        setMyOrders([]);
        return;
      }
      
      // Debug: Check user type
      console.log('🚚 DriverDashboard: User object:', user);
      console.log('🚚 DriverDashboard: User type:', user?.userType);
      
      // Get available orders (driver-specific endpoint)
      const available = await orderService.getAvailableOrders();
      console.log('🚚 DriverDashboard: Available orders loaded:', available.length);
      console.log('🚚 DriverDashboard: Available order details:', available.map(o => ({ id: o.id?.slice(-8), status: o.status, driver: o.driver })));
      
      // Get my assigned orders (driver-specific endpoint)
      const myAssigned = await orderService.getDriverOrders();
      console.log('🚚 DriverDashboard: My assigned orders loaded:', myAssigned.length);
      
      setAvailableOrders(available);
      setMyOrders(myAssigned);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const acceptOrder = async (orderId: string) => {
    console.log('🚚 DriverDashboard: Accept Order button pressed for order:', orderId);
    console.log('🚚 DriverDashboard: Current user ID:', user?.id);
    
    if (!user?.id && !user?._id) {
      console.error('🚚 DriverDashboard: No user ID found');
      Alert.alert('Error', 'User not found');
      return;
    }
    
    try {
      console.log('🚚 DriverDashboard: Calling orderService.assignDriver...');
      // Use the assignDriver method
      const updatedOrder = await orderService.assignDriver(orderId, user.id || user._id);
      console.log('🚚 DriverDashboard: assignDriver result:', updatedOrder);
      
      if (updatedOrder) {
        console.log('🚚 DriverDashboard: Order assigned successfully');
        console.log('🚚 DriverDashboard: Reloading orders...');
        await loadOrders();
        console.log('🚚 DriverDashboard: Orders reloaded');
        Alert.alert('Success', 'Order accepted!');
      } else {
        console.error('🚚 DriverDashboard: assignDriver returned null/undefined');
        Alert.alert('Error', 'Failed to accept order');
      }
    } catch (error) {
      console.error('🚚 DriverDashboard: Error in acceptOrder:', error);
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      Alert.alert('Success', 'Order status updated!');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
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
        return '#ffa726'; // Orange for Available
      case 'ASSIGNED':
        return '#42a5f5'; // Blue for Accepted
      case 'PICKED_UP':
        return '#26a69a'; // Teal for Picked Up
      case 'IN_TRANSIT':
        return '#ff7043'; // Orange for In Transit
      case 'DELIVERED':
        return '#66bb6a'; // Green for Completed
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Available';
      case 'ASSIGNED':
        return 'Accepted';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'DELIVERED':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const renderAvailableOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{(item.id || item._id || '').slice(-8)}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.addressLabel}>From:</Text>
        <Text style={styles.addressText}>{typeof item.pickupAddress === 'string' 
            ? item.pickupAddress 
            : `${item.pickupAddress?.street || ''}, ${item.pickupAddress?.city || ''}, ${item.pickupAddress?.state || ''} ${item.pickupAddress?.zipCode || ''}`
          }</Text>
        
        <Text style={styles.addressLabel}>To:</Text>
        <Text style={styles.addressText}>{typeof item.deliveryAddress === 'string' 
            ? item.deliveryAddress 
            : `${item.deliveryAddress?.street || ''}, ${item.deliveryAddress?.city || ''}, ${item.deliveryAddress?.state || ''} ${item.deliveryAddress?.zipCode || ''}`
          }</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.packageInfo}>
          {item.packageDetails?.numberOfPackages || 1} package{(item.packageDetails?.numberOfPackages || 1) !== 1 ? 's' : ''} • {item.packageDetails?.weight || 0}lbs
        </Text>
      </View>
      
      {/* Package Dimensions */}
      <View style={styles.packageDimensions}>
        <Text style={styles.dimensionsTitle}>Package Details:</Text>
        {item.packageDetails ? (
          <View style={styles.packageItem}>
            <Text style={styles.packageNumber}>Package Details</Text>
            <Text style={styles.packageDimensions}>
              {item.packageDetails.weight}lbs • {item.packageDetails.dimensions?.length || 0}×{item.packageDetails.dimensions?.width || 0}×{item.packageDetails.dimensions?.height || 0}in
            </Text>
            {item.packageDetails.description && (
              <Text style={styles.packageDescription}>{item.packageDetails.description}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.noPackages}>No package details available</Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.acceptButton}
        onPress={() => acceptOrder(item.id || item._id || '')}
      >
        <Text style={styles.acceptButtonText}>Accept Order</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMyOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{(item.id || item._id || '').slice(-8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.addressLabel}>From:</Text>
        <Text style={styles.addressText}>{typeof item.pickupAddress === 'string' 
            ? item.pickupAddress 
            : `${item.pickupAddress?.street || ''}, ${item.pickupAddress?.city || ''}, ${item.pickupAddress?.state || ''} ${item.pickupAddress?.zipCode || ''}`
          }</Text>
        
        <Text style={styles.addressLabel}>To:</Text>
        <Text style={styles.addressText}>{typeof item.deliveryAddress === 'string' 
            ? item.deliveryAddress 
            : `${item.deliveryAddress?.street || ''}, ${item.deliveryAddress?.city || ''}, ${item.deliveryAddress?.state || ''} ${item.deliveryAddress?.zipCode || ''}`
          }</Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.packageInfo}>
          {item.packageDetails?.numberOfPackages || 1} package{(item.packageDetails?.numberOfPackages || 1) !== 1 ? 's' : ''} • {item.packageDetails?.weight || 0}lbs
        </Text>
      </View>
      
      {/* Package Dimensions */}
      <View style={styles.packageDimensions}>
        <Text style={styles.dimensionsTitle}>Package Details:</Text>
        {item.packageDetails ? (
          <View style={styles.packageItem}>
            <Text style={styles.packageNumber}>Package Details</Text>
            <Text style={styles.packageDimensions}>
              {item.packageDetails.weight}lbs • {item.packageDetails.dimensions?.length || 0}×{item.packageDetails.dimensions?.width || 0}×{item.packageDetails.dimensions?.height || 0}in
            </Text>
            {item.packageDetails.description && (
              <Text style={styles.packageDescription}>{item.packageDetails.description}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.noPackages}>No package details available</Text>
        )}
      </View>
      
      <View style={styles.statusButtons}>
        {item.status === 'ASSIGNED' && (
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => updateOrderStatus(item.id || item._id || '', 'PICKED_UP')}
          >
            <Text style={styles.statusButtonText}>Mark as Picked Up</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'PICKED_UP' && (
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => updateOrderStatus(item.id || item._id || '', 'IN_TRANSIT')}
          >
            <Text style={styles.statusButtonText}>Start Delivery</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'IN_TRANSIT' && (
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => updateOrderStatus(item.id || item._id || '', 'DELIVERED')}
          >
            <Text style={styles.statusButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>
        {activeTab === 'available' ? '📦' : '🚚'}
      </Text>
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'available' ? 'No Available Orders' : 'No Active Deliveries'}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'available' 
          ? 'No pending deliveries at the moment. Check back later!'
          : 'You don\'t have any active deliveries. Accept an order to get started!'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <Text style={styles.subtitle}>Manage your deliveries</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            📦 Available ({availableOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-orders' && styles.activeTab]}
          onPress={() => setActiveTab('my-orders')}
        >
          <Text style={[styles.tabText, activeTab === 'my-orders' && styles.activeTabText]}>
            🚚 My Deliveries ({myOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'available' ? availableOrders : myOrders}
        renderItem={activeTab === 'available' ? renderAvailableOrder : renderMyOrder}
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
    fontSize: 14,
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
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  orderDate: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.7,
  },
  orderDetails: {
    marginBottom: 15,
  },
  addressLabel: {
    fontSize: 14,
    color: '#00d4aa',
    fontWeight: '600',
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  packageInfo: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  acceptButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
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
  statusButtons: {
    gap: 10,
  },
  statusButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  packageDimensions: {
    marginTop: 15,
    marginBottom: 15,
  },
  dimensionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 10,
  },
  packageItem: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  packageNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 4,
  },
  packageDimensions: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 2,
  },
  packageDescription: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.8,
    fontStyle: 'italic',
  },
});

export default DriverDashboardScreen;
