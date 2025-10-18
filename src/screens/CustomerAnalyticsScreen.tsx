import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';

interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  totalDistance: number;
  thisMonth: {
    orders: number;
    spent: number;
    deliveries: number;
    savings: number;
  };
  thisQuarter: {
    orders: number;
    spent: number;
    deliveries: number;
    savings: number;
  };
  thisYear: {
    orders: number;
    spent: number;
    deliveries: number;
    savings: number;
  };
}

interface DeliveryPattern {
  id: string;
  orderId: string;
  date: Date;
  deliveryWindow: string;
  distance: number;
  weight: number;
  packages: number;
  cost: number;
  savings: number;
  status: string;
}

interface CostBreakdown {
  basePrice: number;
  distanceCost: number;
  weightCost: number;
  packageCost: number;
  deliveryWindowCost: number;
  gst: number;
  total: number;
}

export default function CustomerAnalyticsScreen() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [deliveryPatterns, setDeliveryPatterns] = useState<DeliveryPattern[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'patterns' | 'insights'>('overview');
  const [timeFilter, setTimeFilter] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadCustomerMetrics();
    loadDeliveryPatterns();
  }, []);

  const loadCustomerMetrics = async () => {
    // Calculate real metrics from order history
    const orders = await orderService.getAllOrders();
    const customerOrders = orders.filter(order => 
      order.customerId === user?.id && 
      order.status === 'delivered'
    );
    
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.price.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const totalDeliveries = customerOrders.length;
    const onTimeDeliveries = customerOrders.filter(order => 
      order.actualDelivery && order.estimatedDelivery && 
      order.actualDelivery <= order.estimatedDelivery
    ).length;
    const totalDistance = customerOrders.reduce((sum, order) => sum + order.distance, 0);
    
    // Calculate loyalty savings
    const loyaltySavings = await calculateLoyaltySavings(customerOrders);
    
    // Filter by time periods
    const now = new Date();
    const thisMonth = customerOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    });
    
    const thisQuarter = customerOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const quarter = Math.floor(now.getMonth() / 3);
      const orderQuarter = Math.floor(orderDate.getMonth() / 3);
      return orderQuarter === quarter && orderDate.getFullYear() === now.getFullYear();
    });
    
    const thisYear = customerOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === now.getFullYear();
    });
    
    const metrics: CustomerMetrics = {
      totalOrders,
      totalSpent,
      averageOrderValue,
      totalDeliveries,
      onTimeDeliveries,
      totalDistance,
      thisMonth: {
        orders: thisMonth.length,
        spent: thisMonth.reduce((sum, order) => sum + order.price.total, 0),
        deliveries: thisMonth.length,
        savings: loyaltySavings.thisMonth,
      },
      thisQuarter: {
        orders: thisQuarter.length,
        spent: thisQuarter.reduce((sum, order) => sum + order.price.total, 0),
        deliveries: thisQuarter.length,
        savings: loyaltySavings.thisQuarter,
      },
      thisYear: {
        orders: thisYear.length,
        spent: thisYear.reduce((sum, order) => sum + order.price.total, 0),
        deliveries: thisYear.length,
        savings: loyaltySavings.thisYear,
      },
    };
    setMetrics(metrics);
  };

  const loadDeliveryPatterns = async () => {
    // Placeholder: In production, this would fetch from your backend
    const mockPatterns: DeliveryPattern[] = [
      {
        id: 'pattern1',
        orderId: 'BB12345678',
        date: new Date('2024-01-16'),
        deliveryWindow: 'Next Day',
        distance: 12.5,
        weight: 45.2,
        packages: 3,
        cost: 28.75,
        savings: 3.45,
        status: 'Delivered',
      },
      {
        id: 'pattern2',
        orderId: 'BB87654321',
        date: new Date('2024-01-15'),
        deliveryWindow: 'Same Day',
        distance: 8.2,
        weight: 23.8,
        packages: 2,
        cost: 32.85,
        savings: 4.20,
        status: 'Delivered',
      },
      {
        id: 'pattern3',
        orderId: 'BB11223344',
        date: new Date('2024-01-14'),
        deliveryWindow: 'Rush',
        distance: 15.8,
        weight: 67.5,
        packages: 4,
        cost: 45.90,
        savings: 5.60,
        status: 'Delivered',
      },
    ];
    setDeliveryPatterns(mockPatterns);
  };

  const getTimeFilterData = () => {
    if (!metrics) return null;
    
    switch (timeFilter) {
      case 'month':
        return metrics.thisMonth;
      case 'quarter':
        return metrics.thisQuarter;
      case 'year':
        return metrics.thisYear;
      default:
        return metrics.thisMonth;
    }
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  const calculateOnTimeRate = () => {
    if (!metrics) return 0;
    return Math.round((metrics.onTimeDeliveries / metrics.totalDeliveries) * 100);
  };

  const calculateCostPerDelivery = () => {
    if (!metrics) return 0;
    return Math.round((metrics.totalSpent / metrics.totalDeliveries) * 100) / 100;
  };

  const calculateTotalSavings = () => {
    if (!metrics) return 0;
    const timeFilterData = getTimeFilterData();
    if (!timeFilterData) return 0;
    return timeFilterData.savings;
  };

  const calculateLoyaltySavings = async (orders: any[]) => {
    // Calculate what the orders would have cost without loyalty discounts
    let totalSavings = 0;
    let thisMonthSavings = 0;
    let thisQuarterSavings = 0;
    let thisYearSavings = 0;
    
    const now = new Date();
    
    for (const order of orders) {
      // Calculate what this order would have cost without loyalty discount
      const originalCost = order.price.subtotal + (order.price.subtotal * 0.05); // Add GST
      const actualCost = order.price.total;
      const savings = originalCost - actualCost;
      
      totalSavings += savings;
      
      const orderDate = new Date(order.createdAt);
      
      // This month
      if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
        thisMonthSavings += savings;
      }
      
      // This quarter
      const quarter = Math.floor(now.getMonth() / 3);
      const orderQuarter = Math.floor(orderDate.getMonth() / 3);
      if (orderQuarter === quarter && orderDate.getFullYear() === now.getFullYear()) {
        thisQuarterSavings += savings;
      }
      
      // This year
      if (orderDate.getFullYear() === now.getFullYear()) {
        thisYearSavings += savings;
      }
    }
    
    return {
      total: totalSavings,
      thisMonth: thisMonthSavings,
      thisQuarter: thisQuarterSavings,
      thisYear: thisYearSavings,
    };
  };

  if (!metrics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics data...</Text>
      </View>
    );
  }

  const timeFilterData = getTimeFilterData();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customer Analytics</Text>
      <Text style={styles.subtitle}>Track your delivery patterns, costs, and savings</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            📊 Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'costs' && styles.activeTab]}
          onPress={() => setActiveTab('costs')}
        >
          <Text style={[styles.tabText, activeTab === 'costs' && styles.activeTabText]}>
            💰 Costs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'patterns' && styles.activeTab]}
          onPress={() => setActiveTab('patterns')}
        >
          <Text style={[styles.tabText, activeTab === 'patterns' && styles.activeTabText]}>
            📈 Patterns
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
            💡 Insights
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          
          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{timeFilterData?.orders}</Text>
              <Text style={styles.metricLabel}>Orders</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${timeFilterData?.spent.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Total Spent</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${timeFilterData?.savings.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Total Savings</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{timeFilterData?.deliveries}</Text>
              <Text style={styles.metricLabel}>Deliveries</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
          </View>

          {/* Performance Stats */}
          <View style={styles.performanceStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Order Value</Text>
              <Text style={styles.statValue}>💰 ${metrics.averageOrderValue.toFixed(2)}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>On-Time Delivery Rate</Text>
              <Text style={styles.statValue}>📈 {calculateOnTimeRate()}%</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Cost per Delivery</Text>
              <Text style={styles.statValue}>💸 ${calculateCostPerDelivery()}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Distance</Text>
              <Text style={styles.statValue}>🚗 {metrics.totalDistance.toFixed(1)} km</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'costs' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Analysis</Text>
          
          {/* Time Filter */}
          <View style={styles.timeFilterContainer}>
            <TouchableOpacity
              style={[styles.timeFilterButton, timeFilter === 'month' && styles.activeTimeFilter]}
              onPress={() => setTimeFilter('month')}
            >
              <Text style={[styles.timeFilterText, timeFilter === 'month' && styles.activeTimeFilterText]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeFilterButton, timeFilter === 'quarter' && styles.activeTimeFilter]}
              onPress={() => setTimeFilter('quarter')}
            >
              <Text style={[styles.timeFilterText, timeFilter === 'quarter' && styles.activeTimeFilterText]}>
                Quarter
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeFilterButton, timeFilter === 'year' && styles.activeTimeFilter]}
              onPress={() => setTimeFilter('year')}
            >
              <Text style={[styles.timeFilterText, timeFilter === 'year' && styles.activeTimeFilterText]}>
                Year
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cost Summary */}
          <View style={styles.costSummary}>
            <View style={styles.costCard}>
              <Text style={styles.costTitle}>Total Spent</Text>
              <Text style={styles.costAmount}>
                ${timeFilterData?.spent.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.costSubtext}>{getTimeFilterLabel()}</Text>
            </View>
            
            <View style={styles.costCard}>
              <Text style={styles.costTitle}>Total Savings</Text>
              <Text style={styles.costAmount}>
                ${timeFilterData?.savings.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.costSubtext}>{getTimeFilterLabel()}</Text>
            </View>
          </View>

          {/* Cost Breakdown Chart Placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>📊 Cost Breakdown Chart</Text>
            <Text style={styles.chartPlaceholderSubtext}>
              In production, this would show a detailed cost breakdown over time
            </Text>
          </View>

          {/* Cost Optimization Tips */}
          <View style={styles.optimizationTips}>
            <Text style={styles.optimizationTitle}>💡 Cost Optimization Tips</Text>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>
                • <Text style={styles.tipHighlight}>Bulk Orders:</Text> Combine multiple packages into single deliveries to reduce per-package costs
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>
                • <Text style={styles.tipHighlight}>Next Day Delivery:</Text> Choose standard delivery windows for the best rates
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>
                • <Text style={styles.tipHighlight}>Weight Management:</Text> Optimize package weights to stay under 25lb thresholds
              </Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'patterns' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Patterns</Text>
          
          {deliveryPatterns.map((pattern) => (
            <View key={pattern.id} style={styles.patternCard}>
              <View style={styles.patternHeader}>
                <Text style={styles.patternOrderId}>📦 {pattern.orderId}</Text>
                <View style={styles.patternStatus}>
                  <Text style={styles.patternStatusText}>
                    {pattern.status === 'Delivered' ? '✅ Delivered' : '⏳ In Progress'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.patternDate}>
                📅 {pattern.date.toLocaleDateString()}
              </Text>
              
              <View style={styles.patternDetails}>
                <View style={styles.patternDetail}>
                  <Text style={styles.detailLabel}>Delivery Window:</Text>
                  <Text style={styles.detailValue}>{pattern.deliveryWindow}</Text>
                </View>
                
                <View style={styles.patternDetail}>
                  <Text style={styles.detailLabel}>Distance:</Text>
                  <Text style={styles.detailValue}>{pattern.distance} km</Text>
                </View>
                
                <View style={styles.patternDetail}>
                  <Text style={styles.detailLabel}>Weight:</Text>
                  <Text style={styles.detailValue}>{pattern.weight} lbs</Text>
                </View>
                
                <View style={styles.patternDetail}>
                  <Text style={styles.detailLabel}>Packages:</Text>
                  <Text style={styles.detailValue}>{pattern.packages}</Text>
                </View>
              </View>
              
              <View style={styles.patternCosts}>
                <Text style={styles.patternCost}>
                  💰 Total Cost: ${pattern.cost.toFixed(2)}
                </Text>
                <Text style={styles.patternSavings}>
                  💡 Savings: ${pattern.savings.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'insights' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Insights</Text>
          
          {/* Performance Insights */}
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>🚀 Delivery Efficiency</Text>
              <Text style={styles.insightText}>
                Your on-time delivery rate of {calculateOnTimeRate()}% is excellent! 
                This reliability helps maintain customer satisfaction and repeat business.
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💰 Cost Management</Text>
              <Text style={styles.insightText}>
                You've saved ${calculateTotalSavings().toFixed(2)} this {timeFilter} through 
                smart delivery choices. Consider bulk ordering for even more savings.
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>📈 Growth Opportunities</Text>
              <Text style={styles.insightText}>
                With {timeFilterData?.orders} orders this {timeFilter}, you're on track for 
                strong growth. Consider expanding delivery zones for more customers.
              </Text>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>🎯 Recommendations</Text>
            
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationLabel}>📦 Package Optimization:</Text>
              <Text style={styles.recommendationText}>
                Consider consolidating smaller packages to reduce per-package costs
              </Text>
            </View>
            
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationLabel}>⏰ Delivery Timing:</Text>
              <Text style={styles.recommendationText}>
                Use Next Day delivery for non-urgent items to maximize savings
              </Text>
            </View>
            
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationLabel}>🚗 Route Planning:</Text>
              <Text style={styles.recommendationText}>
                Group deliveries in similar areas to reduce distance costs
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>📊 Export Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>💰 Cost Calculator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>📱 Share Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#666',
  },
  performanceStats: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTimeFilter: {
    backgroundColor: '#007AFF',
  },
  timeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTimeFilterText: {
    color: 'white',
  },
  costSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  costCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  costTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  costAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  costSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartPlaceholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  chartPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  optimizationTips: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
  },
  optimizationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipItem: {
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipHighlight: {
    fontWeight: '600',
    color: '#007AFF',
  },
  patternCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternOrderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  patternStatus: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  patternStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  patternDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  patternDetails: {
    marginBottom: 12,
  },
  patternDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  patternCosts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  patternCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  patternSavings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  insightsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationsContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  recommendationItem: {
    marginBottom: 16,
  },
  recommendationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});


