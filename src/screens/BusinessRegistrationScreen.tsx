import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function BusinessRegistrationScreen() {
  const { user } = useAuth();
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    taxId: '',
    industry: '',
    website: '',
    phone: '',
    contactPerson: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Canada',
    isTaxExempt: false,
    preferredDeliveryWindow: 'next-day',
    specialInstructions: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'Canada',
    useSameAddress: true,
  });

  const [deliveryPreferences, setDeliveryPreferences] = useState({
    preferredTimeSlots: ['09:00-12:00', '13:00-17:00'],
    maxPackageWeight: '100',
    maxPackageDimensions: '48x48x48',
    requiresSignature: true,
    requiresInsurance: true,
    allowsWeekendDelivery: false,
    allowsHolidayDelivery: false,
  });

  const updateBusinessInfo = (field: string, value: string | boolean) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateDeliveryPreferences = (field: string, value: string | boolean | string[]) => {
    setDeliveryPreferences(prev => ({ ...prev, [field]: value }));
  };

  const saveBusinessInfo = async () => {
    // Validation
    if (!businessInfo.businessName || !businessInfo.businessType || !businessInfo.taxId) {
      Alert.alert('Error', 'Please fill in all required business information');
      return;
    }

    if (!businessInfo.address || !businessInfo.city || !businessInfo.state || !businessInfo.zipCode) {
      Alert.alert('Error', 'Please fill in complete address information');
      return;
    }

    try {
      // Placeholder: In production, this would save to your backend
      Alert.alert(
        'Success!',
        'Business registration completed successfully. Your account will be reviewed by admin.',
        [{ text: 'OK' }]
      );
      
      console.log('Business Info to save:', { businessInfo, deliveryPreferences });
    } catch (error) {
      Alert.alert('Error', 'Failed to save business information');
    }
  };

  const toggleAddressSync = () => {
    const newValue = !businessInfo.useSameAddress;
    setBusinessInfo(prev => ({ ...prev, useSameAddress: newValue }));
    
    if (newValue) {
      // Copy billing address from main address
      setBusinessInfo(prev => ({
        ...prev,
        billingAddress: prev.address,
        billingCity: prev.city,
        billingState: prev.state,
        billingZipCode: prev.zipCode,
        billingCountry: prev.country,
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Business Registration</Text>
      <Text style={styles.subtitle}>Register your business for premium delivery services</Text>

      {/* Business Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏢 Business Information</Text>
        
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., ABC Corporation"
              value={businessInfo.businessName}
              onChangeText={(value) => updateBusinessInfo('businessName', value)}
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Business Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Corporation, LLC"
              value={businessInfo.businessType}
              onChangeText={(value) => updateBusinessInfo('businessType', value)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Tax ID (GST/HST) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 123456789RT0001"
              value={businessInfo.taxId}
              onChangeText={(value) => updateBusinessInfo('taxId', value)}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Industry</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Manufacturing, Retail"
              value={businessInfo.industry}
              onChangeText={(value) => updateBusinessInfo('industry', value)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com"
              value={businessInfo.website}
              onChangeText={(value) => updateBusinessInfo('website', value)}
              keyboardType="url"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="(555) 123-4567"
              value={businessInfo.phone}
              onChangeText={(value) => updateBusinessInfo('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Contact Person</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Smith"
              value={businessInfo.contactPerson}
              onChangeText={(value) => updateBusinessInfo('contactPerson', value)}
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="contact@business.com"
              value={businessInfo.email}
              onChangeText={(value) => updateBusinessInfo('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </View>

      {/* Business Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Business Address</Text>
        
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Business Street"
          value={businessInfo.address}
          onChangeText={(value) => updateBusinessInfo('address', value)}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="Toronto"
              value={businessInfo.city}
              onChangeText={(value) => updateBusinessInfo('city', value)}
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Province/State *</Text>
            <TextInput
              style={styles.input}
              placeholder="ON"
              value={businessInfo.state}
              onChangeText={(value) => updateBusinessInfo('state', value)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Postal Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="M5V 3A8"
              value={businessInfo.zipCode}
              onChangeText={(value) => updateBusinessInfo('zipCode', value)}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Canada"
              value={businessInfo.country}
              onChangeText={(value) => updateBusinessInfo('country', value)}
            />
          </View>
        </View>
      </View>

      {/* Billing Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Billing Address</Text>
        
        <View style={styles.addressSyncRow}>
          <Text style={styles.addressSyncLabel}>Use same address for billing</Text>
          <Switch
            value={businessInfo.useSameAddress}
            onValueChange={toggleAddressSync}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={businessInfo.useSameAddress ? '#fff' : '#f4f3f4'}
          />
        </View>

        {!businessInfo.useSameAddress && (
          <>
            <Text style={styles.label}>Billing Street Address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Billing Street"
              value={businessInfo.billingAddress}
              onChangeText={(value) => updateBusinessInfo('billingAddress', value)}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Billing City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Toronto"
                  value={businessInfo.billingCity}
                  onChangeText={(value) => updateBusinessInfo('billingCity', value)}
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Billing Province/State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ON"
                  value={businessInfo.billingState}
                  onChangeText={(value) => updateBusinessInfo('billingState', value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Billing Postal Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="M5V 3A8"
                  value={businessInfo.billingZipCode}
                  onChangeText={(value) => updateBusinessInfo('billingZipCode', value)}
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Billing Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Canada"
                  value={businessInfo.billingCountry}
                  onChangeText={(value) => updateBusinessInfo('billingCountry', value)}
                />
              </View>
            </View>
          </>
        )}
      </View>

      {/* Delivery Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Delivery Preferences</Text>
        
        <Text style={styles.label}>Preferred Delivery Window</Text>
        <View style={styles.deliveryWindowOptions}>
          {['next-day', 'same-day', 'rush'].map((window) => (
            <TouchableOpacity
              key={window}
              style={[
                styles.deliveryWindowOption,
                businessInfo.preferredDeliveryWindow === window && styles.selectedDeliveryWindow
              ]}
              onPress={() => updateBusinessInfo('preferredDeliveryWindow', window)}
            >
              <Text style={[
                styles.deliveryWindowText,
                businessInfo.preferredDeliveryWindow === window && styles.selectedDeliveryWindowText
              ]}>
                {window === 'next-day' ? 'Next Day' : 
                 window === 'same-day' ? 'Same Day (+25%)' : 'Rush (+75%)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Preferred Time Slots</Text>
        <View style={styles.timeSlotOptions}>
          {['09:00-12:00', '13:00-17:00', '17:00-21:00'].map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlotOption,
                deliveryPreferences.preferredTimeSlots.includes(slot) && styles.selectedTimeSlot
              ]}
              onPress={() => {
                const currentSlots = deliveryPreferences.preferredTimeSlots;
                const newSlots = currentSlots.includes(slot)
                  ? currentSlots.filter(s => s !== slot)
                  : [...currentSlots, slot];
                updateDeliveryPreferences('preferredTimeSlots', newSlots);
              }}
            >
              <Text style={[
                styles.timeSlotText,
                deliveryPreferences.preferredTimeSlots.includes(slot) && styles.selectedTimeSlotText
              ]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Max Package Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              value={deliveryPreferences.maxPackageWeight}
              onChangeText={(value) => updateDeliveryPreferences('maxPackageWeight', value)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Max Dimensions (LxWxH)</Text>
            <TextInput
              style={styles.input}
              placeholder="48x48x48"
              value={deliveryPreferences.maxPackageDimensions}
              onChangeText={(value) => updateDeliveryPreferences('maxPackageDimensions', value)}
            />
          </View>
        </View>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Requires Signature</Text>
          <Switch
            value={deliveryPreferences.requiresSignature}
            onValueChange={(value) => updateDeliveryPreferences('requiresSignature', value)}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={deliveryPreferences.requiresSignature ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Requires Insurance</Text>
          <Switch
            value={deliveryPreferences.requiresInsurance}
            onValueChange={(value) => updateDeliveryPreferences('requiresInsurance', value)}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={deliveryPreferences.requiresInsurance ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Allows Weekend Delivery</Text>
          <Switch
            value={deliveryPreferences.allowsWeekendDelivery}
            onValueChange={(value) => updateDeliveryPreferences('allowsWeekendDelivery', value)}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={deliveryPreferences.allowsWeekendDelivery ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Allows Holiday Delivery</Text>
          <Switch
            value={deliveryPreferences.allowsHolidayDelivery}
            onValueChange={(value) => updateDeliveryPreferences('allowsHolidayDelivery', value)}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={deliveryPreferences.allowsHolidayDelivery ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Special Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Special Instructions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special delivery requirements, access instructions, or notes..."
          value={businessInfo.specialInstructions}
          onChangeText={(value) => updateBusinessInfo('specialInstructions', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Tax Exemption */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Tax Information</Text>
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Tax Exempt Status</Text>
          <Switch
            value={businessInfo.isTaxExempt}
            onValueChange={(value) => updateBusinessInfo('isTaxExempt', value)}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={businessInfo.isTaxExempt ? '#fff' : '#f4f3f4'}
          />
        </View>
        {businessInfo.isTaxExempt && (
          <Text style={styles.note}>
            Tax exempt status requires valid documentation and admin approval.
          </Text>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveBusinessInfo}>
        <Text style={styles.saveButtonText}>💾 Complete Business Registration</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        * Required fields. Business accounts receive priority support and volume discounts.
      </Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addressSyncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressSyncLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deliveryWindowOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  deliveryWindowOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedDeliveryWindow: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  deliveryWindowText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDeliveryWindowText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  timeSlotOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  timeSlotOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  timeSlotText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: -12,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
});


