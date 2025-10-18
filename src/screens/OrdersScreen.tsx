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

const OrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Get the current user ID from auth context
  const customerId = user?.id || 'demo-user-id';

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const customerOrders = await orderService.getOrdersByCustomer(customerId);
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
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

      {/* Expanded Order Details */}
      {selectedOrder?.id === item.id && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Status:</Text>
            <Text style={styles.detailValue}>{getStatusText(item.status)}</Text>
          </View>
          
          {item.driverId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Driver ID:</Text>
              <Text style={styles.detailValue}>{item.driverId}</Text>
            </View>
          )}

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
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📦</Text>
      <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
      <Text style={styles.emptyStateText}>
        You haven't placed any orders yet. Create your first delivery to get started!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track your deliveries</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
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

export default OrdersScreen;

