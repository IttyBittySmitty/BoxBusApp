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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
      if (!user?.id) {
        setOrders([]);
        return;
      }
      
      console.log('Loading orders for user:', user.id);
      const allCustomerOrders = await orderService.getOrdersByCustomer(user.id);
      console.log('Found all orders:', allCustomerOrders.length);
      
      // Filter to show only active orders (not completed or cancelled)
      console.log('All customer orders statuses:', allCustomerOrders.map(o => ({ id: o.id.slice(-8), status: o.status })));
      
      const activeOrders = allCustomerOrders.filter(order => 
        order.status !== OrderStatus.DELIVERED && 
        order.status !== OrderStatus.CANCELLED
      );
      
      console.log('Active orders:', activeOrders.length);
      console.log('Active orders details:', activeOrders.map(o => ({ id: o.id.slice(-8), status: o.status })));
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderService.cancelOrder(orderId);
              Alert.alert('Success', 'Order has been cancelled');
              loadOrders(); // Refresh the orders list
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
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
        return '#ffa726'; // Orange for Pending
      case 'ASSIGNED':
        return '#42a5f5'; // Blue for Accepted
      case 'PICKED_UP':
        return '#26a69a'; // Teal for Picked Up
      case 'IN_TRANSIT':
        return '#ff7043'; // Orange for In Transit
      case 'DELIVERED':
        return '#4caf50'; // Green for Delivered
      case 'CANCELLED':
        return '#f44336'; // Red for Cancelled
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ASSIGNED':
        return 'Accepted';
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

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrder === item.id;
    
    return (
      <View style={styles.orderCard}>
        <TouchableOpacity 
          style={styles.orderHeader}
          onPress={() => setExpandedOrder(isExpanded ? null : item.id)}
        >
          <View style={styles.orderHeaderContent}>
            <Text style={styles.orderId}>Order #{item.id.slice(-8)}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.orderHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.orderDetails}>
          <Text style={styles.addressLabel}>From:</Text>
          <Text style={styles.addressText}>
            {typeof item.pickupAddress === 'string' 
              ? item.pickupAddress 
              : `${item.pickupAddress?.street || ''}, ${item.pickupAddress?.city || ''}, ${item.pickupAddress?.state || ''} ${item.pickupAddress?.zipCode || ''}`
            }
          </Text>
          
          <Text style={styles.addressLabel}>To:</Text>
          <Text style={styles.addressText}>
            {typeof item.deliveryAddress === 'string' 
              ? item.deliveryAddress 
              : `${item.deliveryAddress?.street || ''}, ${item.deliveryAddress?.city || ''}, ${item.deliveryAddress?.state || ''} ${item.deliveryAddress?.zipCode || ''}`
            }
          </Text>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.packageInfo}>
            {item.packageDetails?.numberOfPackages || 1} package{(item.packageDetails?.numberOfPackages || 1) !== 1 ? 's' : ''} • {item.packageDetails?.weight || 0}lbs
          </Text>
          <Text style={styles.priceText}>${item.price.total.toFixed(2)}</Text>
        </View>

        {isExpanded && (
          <View style={styles.expandedDetails}>
            {/* Package Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Package Details</Text>
              <View style={styles.packageItem}>
                <Text style={styles.packageNumber}>
                  {item.packageDetails?.numberOfPackages || 1} Package{(item.packageDetails?.numberOfPackages || 1) !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.packageSpecs}>
                  {item.packageDetails?.weight || 0}lbs • {item.packageDetails?.dimensions?.length || 0}×{item.packageDetails?.dimensions?.width || 0}×{item.packageDetails?.dimensions?.height || 0}in
                </Text>
                {item.packageDetails?.description && (
                  <Text style={styles.packageDescription}>{item.packageDetails.description}</Text>
                )}
              </View>
            </View>

            {/* Cost Breakdown */}
            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>Cost Breakdown</Text>
              <View style={styles.costBreakdown}>
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

            {/* Cancel Button - only show for orders that can be cancelled */}
            {item.status === OrderStatus.PENDING || item.status === OrderStatus.ASSIGNED ? (
              <View style={styles.detailsSection}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelOrder(item.id)}
                >
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  };

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
    paddingVertical: 5,
  },
  orderHeaderContent: {
    flex: 1,
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  expandIcon: {
    fontSize: 16,
    color: '#00d4aa',
    fontWeight: 'bold',
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
  expandedDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ffffff',
    opacity: 0.3,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 10,
  },
  packageItem: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  packageNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 5,
  },
  packageSpecs: {
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
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
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
  cancelButton: {
    backgroundColor: '#ef5350',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrdersScreen;
