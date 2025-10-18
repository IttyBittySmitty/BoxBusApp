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

export default function DriverInfoScreen() {
  const { user } = useAuth();
  const [driverInfo, setDriverInfo] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    cargoCapacity: '',
    licensePlate: '',
    driverLicense: '',
    insuranceProof: '',
    commissionRate: '60',
    isAvailable: false,
  });

  const [availability, setAvailability] = useState({
    monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
    saturday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
    sunday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
  });

  const updateDriverInfo = (field: string, value: string | boolean) => {
    setDriverInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateAvailability = (day: string, field: string, value: string | boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value }
    }));
  };

  const saveDriverInfo = async () => {
    // Validation
    if (!driverInfo.vehicleMake || !driverInfo.vehicleModel || !driverInfo.vehicleYear) {
      Alert.alert('Error', 'Please fill in all vehicle information');
      return;
    }

    if (!driverInfo.licensePlate || !driverInfo.driverLicense || !driverInfo.insuranceProof) {
      Alert.alert('Error', 'Please fill in all license and insurance information');
      return;
    }

    try {
      // Placeholder: In production, this would save to your backend
      // For now, we'll just show a success message
      Alert.alert(
        'Success!',
        'Driver information saved successfully. This will be reviewed by admin.',
        [{ text: 'OK' }]
      );
      
      console.log('Driver Info to save:', { driverInfo, availability });
    } catch (error) {
      Alert.alert('Error', 'Failed to save driver information');
    }
  };

  const uploadDocument = (documentType: string) => {
    // Placeholder: In production, this would open a file picker
    Alert.alert(
      'Document Upload',
      `In production, this would open a file picker for ${documentType}. For now, enter the information manually.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Driver Information</Text>
      <Text style={styles.subtitle}>Complete your driver profile to start accepting orders</Text>

      {/* Vehicle Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚗 Vehicle Information</Text>
        
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Vehicle Make *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ford, Toyota"
              value={driverInfo.vehicleMake}
              onChangeText={(value) => updateDriverInfo('vehicleMake', value)}
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Vehicle Model *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., F-150, Camry"
              value={driverInfo.vehicleModel}
              onChangeText={(value) => updateDriverInfo('vehicleModel', value)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Vehicle Year *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2020"
              value={driverInfo.vehicleYear}
              onChangeText={(value) => updateDriverInfo('vehicleYear', value)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Cargo Capacity (cu ft)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 150"
              value={driverInfo.cargoCapacity}
              onChangeText={(value) => updateDriverInfo('cargoCapacity', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* License & Insurance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 License & Insurance</Text>
        
        <Text style={styles.label}>License Plate *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., ABC-123"
          value={driverInfo.licensePlate}
          onChangeText={(value) => updateDriverInfo('licensePlate', value)}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Driver's License Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your driver's license number"
          value={driverInfo.driverLicense}
          onChangeText={(value) => updateDriverInfo('driverLicense', value)}
        />

        <Text style={styles.label}>Insurance Policy Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your insurance policy number"
          value={driverInfo.insuranceProof}
          onChangeText={(value) => updateDriverInfo('insuranceProof', value)}
        />

        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>Upload Documents (Coming Soon)</Text>
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => uploadDocument('Driver License')}
            >
              <Text style={styles.uploadButtonText}>📄 Driver License</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => uploadDocument('Insurance Card')}
            >
              <Text style={styles.uploadButtonText}>📄 Insurance Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => uploadDocument('Vehicle Registration')}
            >
              <Text style={styles.uploadButtonText}>📄 Vehicle Registration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Commission Rate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Commission Rate</Text>
        <Text style={styles.description}>
          Your commission rate determines how much you earn per delivery. 
          This can be adjusted by admin based on performance.
        </Text>
        
        <Text style={styles.label}>Commission Rate (%)</Text>
        <TextInput
          style={styles.input}
          placeholder="60"
          value={driverInfo.commissionRate}
          onChangeText={(value) => updateDriverInfo('commissionRate', value)}
          keyboardType="numeric"
        />
        <Text style={styles.note}>
          Current rate: {driverInfo.commissionRate}% (Admin adjustable: 40%-80%)
        </Text>
      </View>

      {/* Availability Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Weekly Availability</Text>
        <Text style={styles.description}>
          Set your availability for each day of the week. You must update this weekly.
        </Text>

        {Object.entries(availability).map(([day, schedule]) => (
          <View key={day} style={styles.availabilityRow}>
            <View style={styles.dayToggle}>
              <Text style={styles.dayLabel}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Text>
              <Switch
                value={schedule.isAvailable}
                onValueChange={(value) => updateAvailability(day, 'isAvailable', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={schedule.isAvailable ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            {schedule.isAvailable && (
              <View style={styles.timeInputs}>
                <TextInput
                  style={styles.timeInput}
                  placeholder="09:00"
                  value={schedule.startTime}
                  onChangeText={(value) => updateAvailability(day, 'startTime', value)}
                />
                <Text style={styles.timeSeparator}>to</Text>
                <TextInput
                  style={styles.timeInput}
                  placeholder="17:00"
                  value={schedule.endTime}
                  onChangeText={(value) => updateAvailability(day, 'endTime', value)}
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Current Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🟢 Current Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Available for Orders:</Text>
          <Switch
            value={driverInfo.isAvailable}
            onValueChange={(value) => updateDriverInfo('isAvailable', value)}
            trackColor={{ false: '#767577', true: '#28a745' }}
            thumbColor={driverInfo.isAvailable ? '#fff' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.statusText}>
          {driverInfo.isAvailable 
            ? '✅ You are currently available to accept orders'
            : '❌ You are currently unavailable for orders'
          }
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveDriverInfo}>
        <Text style={styles.saveButtonText}>💾 Save Driver Information</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        * Required fields. Your information will be reviewed by admin before approval.
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
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
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: -12,
    marginBottom: 16,
  },
  uploadSection: {
    marginTop: 16,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  uploadButtons: {
    gap: 8,
  },
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  availabilityRow: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  dayToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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


