import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Order, OrderStatus } from '../types';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

const DriverPortalScreen: React.FC = () => {
  const { user } = useAuth();
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'assigned'>('available');

  // Get the current driver ID from auth context
  const driverId = user?.id || 'demo-driver-id';

  useEffect(() => {
    if (activeTab === 'available') {
      loadAvailableOrders();
    } else {
      loadAssignedOrders();
    }
  }, [activeTab]);

  const loadAvailableOrders = async () => {
    try {
      const orders = await orderService.getAvailableOrders();
      setAvailableOrders(orders);
    } catch (error) {
      console.error('Error loading available orders:', error);
    }
  };

  const loadAssignedOrders = async () => {
    try {
      const orders = await orderService.getOrdersByDriver(driverId);
      setAssignedOrders(orders);
    } catch (error) {
      console.error('Error loading assigned orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'available') {
      await loadAvailableOrders();
    } else {
      await loadAssignedOrders();
    }
    setRefreshing(false);
  };

  const acceptOrder = async (orderId: string) => {
    try {
      await orderService.acceptOrder(orderId, driverId);
      Alert.alert('Success', 'Order accepted successfully!');
      // Refresh both lists
      await loadAvailableOrders();
      await loadAssignedOrders();
      // Switch to assigned tab to show the accepted order
      setActiveTab('assigned');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order. It may have been taken by another driver.');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus, driverId);
      await loadAssignedOrders(); // Refresh the list
      Alert.alert('Success', `Order status updated to ${getStatusText(newStatus)}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return '#ffa726';
      case OrderStatus.CONFIRMED:
        return '#42a5f5';
      case OrderStatus.ASSIGNED:
        return '#7e57c2';
      case OrderStatus.PICKED_UP:
        return '#26a69a';
      case OrderStatus.IN_TRANSIT:
        return '#ff7043';
      case OrderStatus.DELIVERED:
        return '#66bb6a';
      case OrderStatus.CANCELLED:
        return '#ef5350';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.ASSIGNED:
        return 'Driver Assigned';
      case OrderStatus.PICKED_UP:
        return 'Picked Up';
      case OrderStatus.IN_TRANSIT:
        return 'In Transit';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
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

  const renderActionButtons = (order: Order) => {
    const buttons = [];

    if (order.status === OrderStatus.ASSIGNED) {
      buttons.push(
        <TouchableOpacity
          key="pickup"
          style={[styles.actionButton, { backgroundColor: '#26a69a' }]}
          onPress={() => updateOrderStatus(order.id, OrderStatus.PICKED_UP)}
        >
          <Text style={styles.actionButtonText}>Mark as Picked Up</Text>
        </TouchableOpacity>
      );
    }

    if (order.status === OrderStatus.PICKED_UP) {
      buttons.push(
        <TouchableOpacity
          key="transit"
          style={[styles.actionButton, { backgroundColor: '#ff7043' }]}
          onPress={() => updateOrderStatus(order.id, OrderStatus.IN_TRANSIT)}
        >
          <Text style={styles.actionButtonText}>Start Transit</Text>
        </TouchableOpacity>
      );
    }

    if (order.status === OrderStatus.IN_TRANSIT) {
      buttons.push(
        <TouchableOpacity
          key="delivered"
          style={[styles.actionButton, { backgroundColor: '#66bb6a' }]}
          onPress={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
        >
          <Text style={styles.actionButtonText}>Mark as Delivered</Text>
        </TouchableOpacity>
      );
    }

    return buttons;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => setSelectedOrder(selectedOrder?.id === item.id ? null : item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{item.id.slice(-8)}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>From:</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>To:</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.dropoffAddress}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageText}>
            {item.packages.length} package{item.packages.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.weightText}>{item.totalWeight}kg</Text>
        </View>
        <Text style={styles.priceText}>${item.price.total.toFixed(2)}</Text>
      </View>

      {/* Action Buttons */}
      {activeTab === 'available' ? (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#00d4aa' }]}
            onPress={() => acceptOrder(item.id)}
          >
            <Text style={styles.actionButtonText}>Accept Order</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderActionButtons(item).length > 0 && (
          <View style={styles.actionButtonsContainer}>
            {renderActionButtons(item)}
          </View>
        )
      )}

      {/* Expanded Order Details */}
      {selectedOrder?.id === item.id && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Status:</Text>
            <Text style={styles.detailValue}>{getStatusText(item.status)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer ID:</Text>
            <Text style={styles.detailValue}>{item.customerId}</Text>
          </View>

          {item.pickupTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Picked Up:</Text>
              <Text style={styles.detailValue}>{formatDate(item.pickupTime)}</Text>
            </View>
          )}

          {item.deliveryTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delivered:</Text>
              <Text style={styles.detailValue}>{formatDate(item.deliveryTime)}</Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes:</Text>
              <Text style={styles.detailValue}>{item.notes}</Text>
            </View>
          )}

          <View style={styles.packagesList}>
            <Text style={styles.packagesTitle}>Packages:</Text>
            {item.packages.map((pkg, index) => (
              <View key={pkg.id} style={styles.packageItem}>
                <Text style={styles.packageNumber}>Package {index + 1}</Text>
                <Text style={styles.packageDetails}>
                  {pkg.weight}kg • {pkg.length}×{pkg.width}×{pkg.height}cm
                </Text>
                {pkg.description && (
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Proof of Delivery Section */}
          {item.proofOfDelivery && (
            <View style={styles.proofSection}>
              <Text style={styles.proofTitle}>Proof of Delivery</Text>
              <Image
                source={{ uri: item.proofOfDelivery }}
                style={styles.proofImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAvailableEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📦</Text>
      <Text style={styles.emptyStateTitle}>No Available Orders</Text>
      <Text style={styles.emptyStateText}>
        There are no orders available for pickup at the moment. Check back later!
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🚚</Text>
      <Text style={styles.emptyStateTitle}>No Assigned Orders</Text>
      <Text style={styles.emptyStateText}>
        You don't have any orders assigned to you at the moment. Check back later!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available Orders ({availableOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            My Orders ({assignedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>
          {activeTab === 'available' ? 'Available Orders' : 'My Orders'}
        </Text>
        <Text style={styles.subtitle}>
          {activeTab === 'available' 
            ? 'Accept new delivery orders' 
            : 'Manage your assigned deliveries'
          }
        </Text>
        
        {/* Demo Data Refresh Button */}
        {activeTab === 'available' && (
          <TouchableOpacity
            style={styles.refreshDemoButton}
            onPress={async () => {
              try {
                await orderService.refreshDemoOrders();
                await loadAvailableOrders();
                Alert.alert('Success', 'Demo orders refreshed!');
              } catch (error) {
                Alert.alert('Error', 'Failed to refresh demo orders');
              }
            }}
          >
            <Text style={styles.refreshDemoButtonText}>🔄 Refresh Demo Orders</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={activeTab === 'available' ? availableOrders : assignedOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={activeTab === 'available' ? renderAvailableEmptyState : renderEmptyState}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    margin: 20,
    marginBottom: 0,
    borderRadius: 15,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00d4aa',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeTabText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  refreshDemoButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  refreshDemoButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 20,
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
  orderItem: {
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
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.7,
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
  orderDetails: {
    marginBottom: 15,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#00d4aa',
    fontWeight: '600',
    width: 40,
  },
  addressText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageInfo: {
    flexDirection: 'row',
    gap: 15,
  },
  packageText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  weightText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  actionButtonsContainer: {
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expandedDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ffffff',
    opacity: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  detailValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  packagesList: {
    marginTop: 15,
  },
  packagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  packageItem: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  packageNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 5,
  },
  packageDetails: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 3,
  },
  packageDescription: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.6,
    fontStyle: 'italic',
  },
  proofSection: {
    marginTop: 15,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
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

export default DriverPortalScreen;

