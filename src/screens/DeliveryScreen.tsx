import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import { Package } from '../types';
import { DELIVERY_WINDOWS, TIME_UTILS } from '../constants/businessRules';

export default function DeliveryScreen() {
  const { user } = useAuth();
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [packages, setPackages] = useState<Package[]>([
    {
      id: '1',
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      description: 'Package 1',
      fragile: false,
    },
  ]);
  const [selectedDeliveryWindow, setSelectedDeliveryWindow] = useState<'next-day' | 'same-day' | 'rush'>('next-day');
  const [quote, setQuote] = useState<any>(null);

  // Debug logging
  useEffect(() => {
    console.log('DeliveryScreen loaded');
    console.log('DELIVERY_WINDOWS:', DELIVERY_WINDOWS);
    console.log('TIME_UTILS:', TIME_UTILS);
    console.log('Current packages:', packages);
  }, []);

  const addPackage = () => {
    const newPackage: Package = {
      id: Date.now().toString(),
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      description: `Package ${packages.length + 1}`,
      fragile: false,
    };
    setPackages([...packages, newPackage]);
  };

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const updatePackage = (index: number, field: keyof Package, value: any) => {
    const updatedPackages = [...packages];
    updatedPackages[index] = { ...updatedPackages[index], [field]: value };
    setPackages(updatedPackages);
  };

  const calculateQuote = async () => {
    if (!pickupAddress || !dropoffAddress) {
      Alert.alert('Error', 'Please fill in both pickup and dropoff addresses');
      return;
    }

    // For now, using a placeholder distance since we don't have a map API
    const placeholderDistance = 25; // km
    
    const calculatedQuote = await orderService.calculateDeliveryQuote(
      packages,
      placeholderDistance,
      selectedDeliveryWindow,
      user?.id
    );
    
    setQuote(calculatedQuote);
  };

  const placeOrder = async () => {
    if (!quote) {
      Alert.alert('Error', 'Please calculate a quote first');
      return;
    }

    try {
      const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0);
      const totalVolume = packages.reduce((sum, pkg) => sum + (pkg.length * pkg.width * pkg.height), 0);

      const order = await orderService.createOrder({
        customerId: user?.id || 'demo-user-id',
        pickupAddress,
        dropoffAddress,
        packages,
        totalWeight,
        totalVolume,
        distance: 25, // placeholder distance
        deliveryWindow: selectedDeliveryWindow,
        deliveryCutoff: TIME_UTILS.getDeliveryCutoff(selectedDeliveryWindow),
        specialInstructions: '',
      });

      Alert.alert(
        'Order Placed!',
        `Your order has been created with tracking number: ${order.trackingNumber}`,
        [{ text: 'OK' }]
      );

      // Reset form
      setPickupAddress('');
      setDropoffAddress('');
      setPackages([{
        id: '1',
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        description: 'Package 1',
        fragile: false,
      }]);
      setSelectedDeliveryWindow('next-day');
      setQuote(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Delivery</Text>
      
      {/* Debug info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>Debug: DELIVERY_WINDOWS count: {DELIVERY_WINDOWS?.length || 'undefined'}</Text>
        <Text style={styles.debugText}>Debug: Selected window: {selectedDeliveryWindow}</Text>
        <Text style={styles.debugText}>Debug: Packages count: {packages.length}</Text>
      </View>
      
      {/* Note about placeholder distance */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          📍 Note: Distance calculation requires a map API. Currently using placeholder distance of 25 km.
        </Text>
      </View>

      {/* Delivery Window Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Window</Text>
        <View style={styles.deliveryWindowContainer}>
          {DELIVERY_WINDOWS && DELIVERY_WINDOWS.length > 0 ? (
            DELIVERY_WINDOWS.map((window) => (
              <TouchableOpacity
                key={window.type}
                style={[
                  styles.deliveryWindowButton,
                  selectedDeliveryWindow === window.type && styles.selectedDeliveryWindow
                ]}
                onPress={() => setSelectedDeliveryWindow(window.type)}
              >
                <Text style={[
                  styles.deliveryWindowText,
                  selectedDeliveryWindow === window.type && styles.selectedDeliveryWindowText
                ]}>
                  {window.label}
                </Text>
                <Text style={[
                  styles.deliveryWindowDescription,
                  selectedDeliveryWindow === window.type && styles.selectedDeliveryWindowText
                ]}>
                  {window.description}
                </Text>
                <Text style={[
                  styles.deliveryWindowMultiplier,
                  selectedDeliveryWindow === window.type && styles.selectedDeliveryWindowText
                ]}>
                  {window.multiplier > 1 ? `+${((window.multiplier - 1) * 100).toFixed(0)}%` : 'Standard'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.errorText}>Error: DELIVERY_WINDOWS not loaded</Text>
          )}
        </View>
      </View>

      {/* Addresses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Addresses</Text>
        <TextInput
          style={styles.input}
          placeholder="Pickup Address"
          value={pickupAddress}
          onChangeText={setPickupAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Dropoff Address"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
        />
      </View>

      {/* Packages */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Packages</Text>
          <TouchableOpacity style={styles.addButton} onPress={addPackage}>
            <Text style={styles.addButtonText}>+ Add Package</Text>
          </TouchableOpacity>
        </View>
        
        {packages.map((pkg, index) => (
          <View key={pkg.id} style={styles.packageContainer}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>Package {index + 1}</Text>
              {packages.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePackage(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.packageInputs}>
              <TextInput
                style={styles.packageInput}
                placeholder="Enter weight"
                value={pkg.weight === 0 ? '' : pkg.weight.toString()}
                onChangeText={(value) => updatePackage(index, 'weight', value === '' ? 0 : parseFloat(value) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.packageInput}
                placeholder="Enter length"
                value={pkg.length === 0 ? '' : pkg.length.toString()}
                onChangeText={(value) => updatePackage(index, 'length', value === '' ? 0 : parseFloat(value) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.packageInput}
                placeholder="Enter width"
                value={pkg.width === 0 ? '' : pkg.width.toString()}
                onChangeText={(value) => updatePackage(index, 'width', value === '' ? 0 : parseFloat(value) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.packageInput}
                placeholder="Enter height"
                value={pkg.height === 0 ? '' : pkg.height.toString()}
                onChangeText={(value) => updatePackage(index, 'height', value === '' ? 0 : parseFloat(value) || 0)}
                keyboardType="numeric"
              />
            </View>
            
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description"
              value={pkg.description}
              onChangeText={(value) => updatePackage(index, 'description', value)}
            />
            
            <TouchableOpacity
              style={[styles.fragileButton, pkg.fragile && styles.fragileButtonActive]}
              onPress={() => updatePackage(index, 'fragile', !pkg.fragile)}
            >
              <Text style={[styles.fragileButtonText, pkg.fragile && styles.fragileButtonTextActive]}>
                {pkg.fragile ? '✓ Fragile' : 'Fragile'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Quote and Order */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.calculateButton} onPress={calculateQuote}>
          <Text style={styles.calculateButtonText}>Calculate Quote</Text>
        </TouchableOpacity>

        {quote && (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteTitle}>Delivery Quote</Text>
            <View style={styles.quoteDetails}>
              <Text style={styles.quoteRow}>Base Price: ${quote.basePrice.toFixed(2)}</Text>
              <Text style={styles.quoteRow}>Distance Fee: ${quote.distanceFee.toFixed(2)}</Text>
              <Text style={styles.quoteRow}>Weight Fee: ${quote.weightFee.toFixed(2)}</Text>
              <Text style={styles.quoteRow}>Package Fee: ${quote.packageFee.toFixed(2)}</Text>
              <Text style={styles.quoteRow}>Delivery Window: {selectedDeliveryWindow === 'next-day' ? 'Standard' : selectedDeliveryWindow === 'same-day' ? '+25%' : '+75%'}</Text>
              <Text style={styles.quoteRow}>Subtotal: ${quote.subtotal.toFixed(2)}</Text>
              {quote.loyaltyDiscount && quote.loyaltyDiscount > 0 && (
                <Text style={[styles.quoteRow, styles.loyaltyDiscountRow]}>
                  🎉 Loyalty Discount ({quote.loyaltyDiscountPercent}%): -${quote.loyaltyDiscount.toFixed(2)}
                </Text>
              )}
              <Text style={styles.quoteRow}>GST (5%): ${quote.gst.toFixed(2)}</Text>
              <Text style={styles.quoteRow}>Total: ${quote.totalPrice.toFixed(2)}</Text>
              <Text style={styles.quoteRow}>Estimated Delivery: {quote.estimatedDeliveryTime}</Text>
            </View>
            
            <TouchableOpacity style={styles.placeOrderButton} onPress={placeOrder}>
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  debugContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  debugText: {
    color: '#856404',
    fontSize: 14,
    marginBottom: 4,
  },
  noteContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  noteText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  deliveryWindowContainer: {
    gap: 12,
  },
  deliveryWindowButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  selectedDeliveryWindow: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  deliveryWindowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedDeliveryWindowText: {
    color: '#007AFF',
  },
  deliveryWindowDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deliveryWindowMultiplier: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  packageContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  packageInputs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  packageInput: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: 'white',
  },
  fragileButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  fragileButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  fragileButtonText: {
    color: '#666',
    fontSize: 14,
  },
  fragileButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  calculateButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  quoteContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  quoteDetails: {
    marginBottom: 16,
  },
  quoteRow: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  loyaltyDiscountRow: {
    color: '#28a745',
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

