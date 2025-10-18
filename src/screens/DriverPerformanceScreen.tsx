import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface DriverMetrics {
  totalDeliveries: number;
  totalEarnings: number;
  totalTips: number;
  averageRating: number;
  onTimeDeliveries: number;
  totalDistance: number;
  totalHours: number;
  commissionRate: number;
  thisWeek: {
    deliveries: number;
    earnings: number;
    tips: number;
    hours: number;
  };
  thisMonth: {
    deliveries: number;
    earnings: number;
    tips: number;
    hours: number;
  };
}

interface DeliveryHistory {
  id: string;
  orderId: string;
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: number;
  earnings: number;
  tips: number;
  rating: number;
  completedAt: Date;
  status: 'completed' | 'cancelled';
}

export default function DriverPerformanceScreen() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DriverMetrics | null>(null);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'history' | 'analytics'>('overview');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadDriverMetrics();
    loadDeliveryHistory();
  }, []);

  const loadDriverMetrics = async () => {
    // Placeholder: In production, this would fetch from your backend
    const mockMetrics: DriverMetrics = {
      totalDeliveries: 127,
      totalEarnings: 2847.50,
      totalTips: 342.75,
      averageRating: 4.8,
      onTimeDeliveries: 119,
      totalDistance: 2847.3,
      totalHours: 156.5,
      commissionRate: 60,
      thisWeek: {
        deliveries: 8,
        earnings: 189.25,
        tips: 28.50,
        hours: 12.5,
      },
      thisMonth: {
        deliveries: 32,
        earnings: 756.80,
        tips: 89.25,
        hours: 48.0,
      },
    };
    setMetrics(mockMetrics);
  };

  const loadDeliveryHistory = async () => {
    // Placeholder: In production, this would fetch from your backend
    const mockHistory: DeliveryHistory[] = [
      {
        id: 'delivery1',
        orderId: 'BB12345678',
        customerName: 'John Smith',
        pickupAddress: '123 Main St, Toronto',
        dropoffAddress: '456 Oak Ave, Toronto',
        distance: 12.5,
        earnings: 23.75,
        tips: 5.00,
        rating: 5,
        completedAt: new Date('2024-01-16'),
        status: 'completed',
      },
      {
        id: 'delivery2',
        orderId: 'BB87654321',
        customerName: 'Sarah Johnson',
        pickupAddress: '789 Pine St, Toronto',
        dropoffAddress: '321 Elm St, Toronto',
        distance: 8.2,
        earnings: 19.85,
        tips: 3.50,
        rating: 4,
        completedAt: new Date('2024-01-15'),
        status: 'completed',
      },
      {
        id: 'delivery3',
        orderId: 'BB11223344',
        customerName: 'Mike Wilson',
        pickupAddress: '555 Commerce Blvd, Toronto',
        dropoffAddress: '888 Residential Lane, Toronto',
        distance: 15.8,
        earnings: 28.90,
        tips: 7.00,
        rating: 5,
        completedAt: new Date('2024-01-14'),
        status: 'completed',
      },
    ];
    setDeliveryHistory(mockHistory);
  };

  const getTimeFilterData = () => {
    if (!metrics) return null;
    
    switch (timeFilter) {
      case 'week':
        return metrics.thisWeek;
      case 'month':
        return metrics.thisMonth;
      case 'year':
        return {
          deliveries: metrics.totalDeliveries,
          earnings: metrics.totalEarnings,
          tips: metrics.totalTips,
          hours: metrics.totalHours,
        };
      default:
        return metrics.thisWeek;
    }
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Week';
    }
  };

  const calculateEfficiency = () => {
    if (!metrics) return 0;
    return Math.round((metrics.onTimeDeliveries / metrics.totalDeliveries) * 100);
  };

  const calculateHourlyRate = () => {
    if (!metrics) return 0;
    const timeFilterData = getTimeFilterData();
    if (!timeFilterData) return 0;
    return Math.round((timeFilterData.earnings / timeFilterData.hours) * 100) / 100;
  };

  if (!metrics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  const timeFilterData = getTimeFilterData();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Driver Performance</Text>
      <Text style={styles.subtitle}>Track your earnings, ratings, and delivery metrics</Text>

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
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
            💰 Earnings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            📋 History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            📈 Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          
          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${timeFilterData?.earnings.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Total Earnings</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{timeFilterData?.deliveries}</Text>
              <Text style={styles.metricLabel}>Deliveries</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${timeFilterData?.tips.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Tips Earned</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{timeFilterData?.hours}h</Text>
              <Text style={styles.metricLabel}>Hours Worked</Text>
              <Text style={styles.metricSubtext}>{getTimeFilterLabel()}</Text>
            </View>
          </View>

          {/* Performance Stats */}
          <View style={styles.performanceStats}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Average Rating</Text>
              <Text style={styles.statValue}>⭐ {metrics.averageRating}/5.0</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>On-Time Delivery Rate</Text>
              <Text style={styles.statValue}>📈 {calculateEfficiency()}%</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Commission Rate</Text>
              <Text style={styles.statValue}>💰 {metrics.commissionRate}%</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Hourly Rate</Text>
              <Text style={styles.statValue}>⏰ ${calculateHourlyRate()}/hr</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'earnings' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          
          {/* Time Filter */}
          <View style={styles.timeFilterContainer}>
            <TouchableOpacity
              style={[styles.timeFilterButton, timeFilter === 'week' && styles.activeTimeFilter]}
              onPress={() => setTimeFilter('week')}
            >
              <Text style={[styles.timeFilterText, timeFilter === 'week' && styles.activeTimeFilterText]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeFilterButton, timeFilter === 'month' && styles.activeTimeFilter]}
              onPress={() => setTimeFilter('month')}
            >
              <Text style={[styles.timeFilterText, timeFilter === 'month' && styles.activeTimeFilterText]}>
                Month
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

          {/* Earnings Summary */}
          <View style={styles.earningsSummary}>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsTitle}>Base Earnings</Text>
              <Text style={styles.earningsAmount}>
                ${timeFilterData ? (timeFilterData.earnings - timeFilterData.tips).toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.earningsSubtext}>Commission from deliveries</Text>
            </View>
            
            <View style={styles.earningsCard}>
              <Text style={styles.earningsTitle}>Tips</Text>
              <Text style={styles.earningsAmount}>
                ${timeFilterData?.tips.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.earningsSubtext}>100% goes to you</Text>
            </View>
          </View>

          {/* Earnings Chart Placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>📊 Earnings Chart</Text>
            <Text style={styles.chartPlaceholderSubtext}>
              In production, this would show a detailed earnings chart over time
            </Text>
          </View>
        </View>
      )}

      {activeTab === 'history' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery History</Text>
          
          {deliveryHistory.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <Text style={styles.deliveryOrderId}>📦 {delivery.orderId}</Text>
                <View style={styles.deliveryStatus}>
                  <Text style={styles.deliveryStatusText}>
                    {delivery.status === 'completed' ? '✅ Completed' : '❌ Cancelled'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.deliveryCustomer}>👤 {delivery.customerName}</Text>
              
              <View style={styles.deliveryAddresses}>
                <Text style={styles.deliveryAddress}>
                  📍 <Text style={styles.addressLabel}>From:</Text> {delivery.pickupAddress}
                </Text>
                <Text style={styles.deliveryAddress}>
                  🎯 <Text style={styles.addressLabel}>To:</Text> {delivery.dropoffAddress}
                </Text>
              </View>
              
              <View style={styles.deliveryMetrics}>
                <Text style={styles.deliveryMetric}>
                  🚗 {delivery.distance} km
                </Text>
                <Text style={styles.deliveryMetric}>
                  💰 ${delivery.earnings.toFixed(2)}
                </Text>
                <Text style={styles.deliveryMetric}>
                  💡 ${delivery.tips.toFixed(2)}
                </Text>
                <Text style={styles.deliveryMetric}>
                  ⭐ {delivery.rating}/5
                </Text>
              </View>
              
              <Text style={styles.deliveryDate}>
                📅 {delivery.completedAt.toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'analytics' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Analytics</Text>
          
          {/* Performance Insights */}
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>🚀 Performance Trend</Text>
              <Text style={styles.insightText}>
                Your on-time delivery rate of {calculateEfficiency()}% is excellent! 
                Keep up the great work to maintain high ratings.
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💰 Earnings Optimization</Text>
              <Text style={styles.insightText}>
                Your hourly rate of ${calculateHourlyRate()} is above average. 
                Consider peak hours for maximum earnings.
              </Text>
            </View>
            
            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>⭐ Customer Satisfaction</Text>
              <Text style={styles.insightText}>
                With a {metrics.averageRating}/5 rating, customers love your service! 
                This helps you get priority for high-value orders.
              </Text>
            </View>
          </View>

          {/* Goals and Targets */}
          <View style={styles.goalsContainer}>
            <Text style={styles.goalsTitle}>🎯 This Week's Goals</Text>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Deliveries:</Text>
              <Text style={styles.goalValue}>10 deliveries</Text>
            </View>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Earnings:</Text>
              <Text style={styles.goalValue}>$250</Text>
            </View>
            
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Target Hours:</Text>
              <Text style={styles.goalValue}>15 hours</Text>
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
            <Text style={styles.quickActionText}>💰 Request Payout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>📱 Share Stats</Text>
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
  earningsSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  earningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartPlaceholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
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
  deliveryCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryOrderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deliveryStatus: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deliveryCustomer: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  deliveryAddresses: {
    marginBottom: 12,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  addressLabel: {
    fontWeight: '600',
    color: '#333',
  },
  deliveryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deliveryMetric: {
    fontSize: 12,
    color: '#666',
  },
  deliveryDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
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
  goalsContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 16,
    color: '#333',
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
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


