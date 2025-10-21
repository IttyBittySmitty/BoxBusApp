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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import apiService from '../services/apiService';
import { Package } from '../types';
import { DELIVERY_WINDOWS, TIME_UTILS } from '../constants/businessRules';

export default function DeliveryScreen() {
  const navigation = useNavigation();
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
  const [isCalculating, setIsCalculating] = useState(false);


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
    setIsCalculating(true);
    
    if (!pickupAddress || !dropoffAddress) {
      Alert.alert('Error', 'Please fill in both pickup and dropoff addresses');
      setIsCalculating(false);
      return;
    }

    // Validate pickup address
    const pickupValidation = { isValid: pickupAddress.trim().length > 0, message: '' };
    if (!pickupValidation.isValid) {
      Alert.alert(
        'Invalid Pickup Address',
        pickupValidation.message,
        [
          { text: 'OK' },
          { text: 'See Examples', onPress: () => showAddressExamples() }
        ]
      );
      setIsCalculating(false);
      return;
    }

    // Validate dropoff address
    const dropoffValidation = { isValid: dropoffAddress.trim().length > 0, message: '' };
    if (!dropoffValidation.isValid) {
      Alert.alert(
        'Invalid Dropoff Address',
        dropoffValidation.message,
        [
          { text: 'OK' },
          { text: 'See Examples', onPress: () => showAddressExamples() }
        ]
      );
      setIsCalculating(false);
      return;
    }

    // Calculate real distance using backend API
    try {
      const distanceResult = await apiService.calculateDistance(pickupAddress, dropoffAddress);
      const realDistance = distanceResult.distance;
      
      const calculatedQuote = await orderService.calculateDeliveryQuote(
        packages,
        realDistance,
        selectedDeliveryWindow,
        user?.id,
        distanceResult.duration
      );
      
      setQuote(calculatedQuote);
    } catch (error) {
      console.error('Distance calculation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Distance Calculation Failed',
        `Unable to calculate distance: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const placeOrder = async () => {
    console.log('🔥 BUTTON CLICKED - placeOrder function called!');
    
    if (!quote) {
      console.log('🔥 ERROR: No quote found');
      Alert.alert('Error', 'Please calculate a quote first');
      return;
    }

    if (!user?.id) {
      console.log('🔥 ERROR: No user ID found');
      Alert.alert('Error', 'You must be logged in to place an order');
      return;
    }

    try {
      console.log('🚀 DELIVERY SCREEN: Starting order creation...');
      console.log('🚀 DELIVERY SCREEN: User object:', user);
      console.log('🚀 DELIVERY SCREEN: User ID:', user?.id);
      
      const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0);
      const totalVolume = packages.reduce((sum, pkg) => sum + (pkg.length * pkg.width * pkg.height), 0);

      console.log('🚀 DELIVERY SCREEN: About to call orderService.createOrder...');
      const order = await orderService.createOrder({
        customerId: user?.id,
        pickupAddress,
        dropoffAddress,
        packages,
        totalWeight,
        totalVolume,
        distance: quote.distance,
        deliveryWindow: selectedDeliveryWindow,
        deliveryCutoff: TIME_UTILS.getDeliveryCutoff(selectedDeliveryWindow),
        specialInstructions: '',
        price: {
          basePrice: quote.basePrice,
          distanceFee: quote.distanceFee,
          weightFee: quote.weightFee,
          packageFee: quote.packageFee,
          deliveryWindowMultiplier: quote.deliveryWindowMultiplier,
          subtotal: quote.subtotal,
          gst: quote.gst,
          total: quote.totalPrice
        }
      });

      Alert.alert(
        'Order Placed!',
        `Your order has been created with tracking number: ${order.trackingNumber}`,
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('Orders' as never)
        }]
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
      console.error('❌ Order creation failed:', error);
      Alert.alert('Error', `Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const showAddressExamples = () => {
    const examples = [
      '1234 Main Street, Vancouver, BC V5A 1A1',
      '5678 Kingsway, Burnaby, BC V5H 2A1',
      '9012 Granville Street, Vancouver, BC V6H 3J1'
    ];
    Alert.alert(
      'Address Format Examples',
      examples.join('\n\n'),
      [{ text: 'OK' }]
    );
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Delivery</Text>
      
      
      {/* Note about distance calculation */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          📍 Distance is calculated using real-time mapping data for accurate pricing.
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
          placeholder="Pickup Address (e.g., 123 Main Street, Toronto, ON M5V 3A8)"
          value={pickupAddress}
          onChangeText={setPickupAddress}
          multiline
          numberOfLines={2}
        />
        <TextInput
          style={styles.input}
          placeholder="Dropoff Address (e.g., 456 Queen Street, Toronto, ON M5H 2M9)"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
          multiline
          numberOfLines={2}
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
                placeholder="Weight (lbs)"
                value={pkg.weight === 0 ? '' : pkg.weight.toString()}
                onChangeText={(value) => updatePackage(index, 'weight', value === '' ? 0 : parseFloat(value) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.packageInput}
                placeholder="Length (in)"
                value={pkg.length === 0 ? '' : pkg.length.toString()}
                onChangeText={(value) => updatePackage(index, 'length', value === '' ? 0 : parseFloat(value) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.packageInput}
                placeholder="Width (in)"
                value={pkg.width === 0 ? '' : pkg.width.toString()}
                onChangeText={(value) => updatePackage(index, 'width', value === '' ? 0 : parseFloat(value) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.packageInput}
                placeholder="Height (in)"
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
        <TouchableOpacity 
          style={[styles.calculateButton, isCalculating && styles.calculateButtonDisabled]} 
          onPress={calculateQuote}
          disabled={isCalculating}
        >
          <Text style={styles.calculateButtonText}>
            {isCalculating ? 'Calculating...' : 'Calculate Quote'}
          </Text>
        </TouchableOpacity>

        {quote && (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteTitle}>Delivery Quote</Text>
            <View style={styles.quoteDetails}>
              <Text style={styles.quoteRow}>Distance: {quote.distance.toFixed(1)} km</Text>
              <Text style={styles.quoteRow}>Travel Time: {quote.duration || 'Calculating...'}</Text>
              <Text style={styles.quoteRow}>Handling Time: 10 minutes</Text>
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
            
            <TouchableOpacity 
              style={styles.placeOrderButton} 
              onPress={placeOrder}
            >
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
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
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
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00d4aa',
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
    color: '#ffffff',
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
    borderColor: '#444',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#16213e',
  },
  selectedDeliveryWindow: {
    borderColor: '#00d4aa',
    backgroundColor: '#0f3460',
  },
  deliveryWindowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedDeliveryWindowText: {
    color: '#007AFF',
  },
  deliveryWindowDescription: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
    opacity: 0.8,
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
    borderWidth: 2,
    borderColor: '#00d4aa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#16213e',
    color: '#ffffff',
    textAlignVertical: 'top',
    minHeight: 50,
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
    borderWidth: 2,
    borderColor: '#00d4aa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#16213e',
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
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
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
  calculateButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  quoteContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00d4aa',
    marginBottom: 20,
  },
  quoteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#00d4aa',
  },
  quoteDetails: {
    marginBottom: 16,
  },
  quoteRow: {
    fontSize: 14,
    marginBottom: 6,
    color: '#ffffff',
  },
  loyaltyDiscountRow: {
    color: '#00d4aa',
    fontWeight: 'bold',
    backgroundColor: '#0f3460',
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

