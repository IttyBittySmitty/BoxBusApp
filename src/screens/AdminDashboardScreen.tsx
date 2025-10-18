import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import { Order, OrderStatus, User } from '../types';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'analytics'>('orders');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Placeholder: In production, this would fetch from your backend
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadOrders(); // Refresh the list
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const reassignOrder = async (orderId: string, newDriverId: string) => {
    try {
      await orderService.assignDriver(orderId, newDriverId);
      await loadOrders();
      Alert.alert('Success', 'Order reassigned successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to reassign order');
    }
  };

  const deleteOrder = async (orderId: string) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this order? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Placeholder: In production, this would call your backend
              const updatedOrders = orders.filter(order => order.id !== orderId);
              setOrders(updatedOrders);
              Alert.alert('Success', 'Order deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete order');
            }
          },
        },
      ]
    );
  };

  const filteredOrders = orders.filter(order =>
    order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'assigned': return '#007bff';
      case 'picked-up': return '#fd7e14';
      case 'in-transit': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            📦 Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            👥 Users
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

      {activeTab === 'orders' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Management</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadOrders}>
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders by tracking number or address..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {/* Orders List */}
          {filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.trackingNumber}>📦 {order.trackingNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.addressText}>
                  📍 <Text style={styles.label}>From:</Text> {order.pickupAddress}
                </Text>
                <Text style={styles.addressText}>
                  🎯 <Text style={styles.label}>To:</Text> {order.dropoffAddress}
                </Text>
                <Text style={styles.orderInfo}>
                  📦 {order.packages.length} packages • {order.totalWeight} lbs • ${order.price.total}
                </Text>
                <Text style={styles.orderInfo}>
                  🚚 {order.deliveryWindow} • {order.driverId ? `Driver: ${order.driverId}` : 'No driver assigned'}
                </Text>
              </View>

              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedOrder(order);
                    setIsOrderModalVisible(true);
                  }}
                >
                  <Text style={styles.actionButtonText}>✏️ Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedOrder(order);
                    // Placeholder: In production, this would open a driver selection modal
                    Alert.alert('Driver Selection', 'Driver selection modal would open here');
                  }}
                >
                  <Text style={styles.actionButtonText}>👤 Assign Driver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteOrder(order.id)}
                >
                  <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredOrders.length === 0 && (
            <Text style={styles.noOrdersText}>
              {searchTerm ? 'No orders match your search.' : 'No orders found.'}
            </Text>
          )}
        </View>
      )}

      {activeTab === 'users' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <Text style={styles.placeholderText}>
            🔧 User management interface coming soon...
          </Text>
          <Text style={styles.placeholderText}>
            This will include:
          </Text>
          <Text style={styles.placeholderText}>• Edit customer information</Text>
          <Text style={styles.placeholderText}>• Manage driver accounts</Text>
          <Text style={styles.placeholderText}>• Adjust driver commission rates</Text>
          <Text style={styles.placeholderText}>• View business customer details</Text>
        </View>
      )}

      {activeTab === 'analytics' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Analytics</Text>
          <Text style={styles.placeholderText}>
            📊 Analytics dashboard coming soon...
          </Text>
          <Text style={styles.placeholderText}>
            This will include:
          </Text>
          <Text style={styles.placeholderText}>• Revenue tracking</Text>
          <Text style={styles.placeholderText}>• Driver performance metrics</Text>
          <Text style={styles.placeholderText}>• Delivery time analytics</Text>
          <Text style={styles.placeholderText}>• Customer satisfaction scores</Text>
        </View>
      )}

      {/* Order Edit Modal */}
      <Modal
        visible={isOrderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Order</Text>
            
            {selectedOrder && (
              <View>
                <Text style={styles.modalLabel}>Status:</Text>
                <View style={styles.statusOptions}>
                  {Object.values(OrderStatus).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        selectedOrder.status === status && styles.selectedStatusOption
                      ]}
                      onPress={() => updateOrderStatus(selectedOrder.id, status)}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        selectedOrder.status === status && styles.selectedStatusOptionText
                      ]}>
                        {getStatusLabel(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.modalLabel}>Priority:</Text>
                <View style={styles.priorityOptions}>
                  {['low', 'normal', 'high', 'urgent'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        selectedOrder.priority === priority && styles.selectedPriorityOption
                      ]}
                      onPress={() => {
                        // Placeholder: In production, this would update the order
                        Alert.alert('Priority Update', `Priority updated to ${priority}`);
                      }}
                    >
                      <Text style={[
                        styles.priorityOptionText,
                        selectedOrder.priority === priority && styles.selectedPriorityOptionText
                      ]}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsOrderModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
  },
  orderCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  orderInfo: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  noOrdersText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedStatusOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  statusOptionText: {
    color: '#666',
    fontSize: 14,
  },
  selectedStatusOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  priorityOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedPriorityOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  priorityOptionText: {
    color: '#666',
    fontSize: 14,
  },
  selectedPriorityOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


