import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Order, OrderStatus } from '../types';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

const ArchiveScreen: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      if (!user?.id && !user?._id) {
        setOrders([]);
        return;
      }
      
      // Get all orders
      console.log('📦 ArchiveScreen: Loading orders for user:', user?.id || user?._id, 'type:', user?.userType);
      
      let archivedOrders: Order[] = [];
      
      if (user.userType === 'admin') {
        // For admins: get all orders and filter for completed/cancelled
        const allOrders = await orderService.getAllOrders();
        console.log('📦 ArchiveScreen: All orders fetched:', allOrders.length, 'orders.');
        archivedOrders = allOrders.filter(order => 
          order.status === 'DELIVERED' || 
          order.status === 'CANCELLED'
        );
      } else if (user.userType === 'driver') {
        // For drivers: get their completed orders directly
        const completedOrders = await orderService.getDriverCompletedOrders();
        console.log('📦 ArchiveScreen: Driver completed orders fetched:', completedOrders.length, 'orders.');
        archivedOrders = completedOrders;
      } else {
        // For customers: get their orders and filter for completed/cancelled
        const customerOrders = await orderService.getCustomerOrders();
        console.log('📦 ArchiveScreen: Customer orders fetched:', customerOrders.length, 'orders.');
        console.log('📦 ArchiveScreen: Customer order statuses:', customerOrders.map(o => ({ id: o.id?.slice(-8), status: o.status })));
        console.log('📦 ArchiveScreen: All customer orders:', customerOrders);
        archivedOrders = customerOrders.filter(order => 
          order.status === 'DELIVERED' || 
          order.status === 'CANCELLED'
        );
        console.log('📦 ArchiveScreen: Filtered customer orders:', archivedOrders.length, 'orders.');
      }
      
      console.log('📁 ArchiveScreen: Found archived orders:', archivedOrders.length);
      console.log('📦 ArchiveScreen: Filtered archived orders:', archivedOrders.length, 'orders.');
      setOrders(archivedOrders);
    } catch (error) {
      console.error('Error loading archived orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
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
          <Text style={styles.orderId}>Order #{(item.id || item._id || '').slice(-8)}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'DELIVERED' ? 'Delivered' : item.status === 'CANCELLED' ? 'Cancelled' : item.status || 'Unknown'}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>From:</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {typeof item.pickupAddress === 'string' 
              ? item.pickupAddress 
              : `${item.pickupAddress?.street || ''}, ${item.pickupAddress?.city || ''}, ${item.pickupAddress?.state || ''} ${item.pickupAddress?.zipCode || ''}`
            }
          </Text>
        </View>
        <View style={styles.addressRow}>
          <Text style={styles.addressLabel}>To:</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {typeof item.deliveryAddress === 'string' 
              ? item.deliveryAddress 
              : `${item.deliveryAddress?.street || ''}, ${item.deliveryAddress?.city || ''}, ${item.deliveryAddress?.state || ''} ${item.deliveryAddress?.zipCode || ''}`
            }
          </Text>
        </View>
        {user?.userType === 'driver' && item.customer && (
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Customer:</Text>
            <Text style={styles.contactText}>
              {item.customer.firstName} {item.customer.lastName} • {item.customer.phone}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageText}>
            {item.packageDetails?.numberOfPackages || 1} package{(item.packageDetails?.numberOfPackages || 1) !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.weightText}>{item.packageDetails?.weight || 0}lbs</Text>
        </View>
        {user?.userType !== 'driver' && (
          <Text style={styles.priceText}>${item.price.total.toFixed(2)}</Text>
        )}
      </View>

      {/* Expanded Order Details */}
      {(selectedOrder?.id || selectedOrder?._id) === (item.id || item._id) && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Status:</Text>
            <Text style={styles.detailValue}>{getStatusText(item.status)}</Text>
          </View>
          
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
            {item.packageDetails ? (
              <View style={styles.packageItem}>
                <Text style={styles.packageNumber}>Package Details</Text>
                <Text style={styles.packageDetails}>
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

          <View style={styles.costBreakdown}>
            <Text style={styles.costTitle}>Cost Breakdown:</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Base Price:</Text>
              <Text style={styles.costValue}>${item.price.basePrice.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Distance Fee:</Text>
              <Text style={styles.costValue}>${item.price.distanceFee.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Weight Fee:</Text>
              <Text style={styles.costValue}>${item.price.weightFee.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Package Fee:</Text>
              <Text style={styles.costValue}>${item.price.packageFee.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Subtotal:</Text>
              <Text style={styles.costValue}>${item.price.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>GST:</Text>
              <Text style={styles.costValue}>${item.price.gst.toFixed(2)}</Text>
            </View>
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${item.price.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📁</Text>
      <Text style={styles.emptyStateTitle}>No Completed Orders</Text>
      <Text style={styles.emptyStateText}>
        Your completed and cancelled orders will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Completed Orders</Text>
        <Text style={styles.subtitle}>View your completed and cancelled orders</Text>
      </View>

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
  costBreakdown: {
    marginTop: 15,
    backgroundColor: '#0f3460',
    borderRadius: 10,
    padding: 12,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 10,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  costLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  costValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ffffff',
    opacity: 0.3,
    paddingTop: 8,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4aa',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4aa',
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00d4aa',
    marginRight: 8,
  },
  contactText: {
    fontSize: 12,
    color: '#ffffff',
    flex: 1,
  },
});

export default ArchiveScreen;
