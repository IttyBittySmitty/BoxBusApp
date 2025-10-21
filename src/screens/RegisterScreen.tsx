import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { UserType } from '../types';

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    userType: 'customer' as UserType,
  });
  
  const { register, isLoading, error } = useAuth();
  const navigation = useNavigation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Simple validation without alerts
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.password || !formData.confirmPassword) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        userType: formData.userType,
      }, formData.password);

      // Simple navigation - no alerts that could interfere with scrolling
      if (formData.userType === 'driver') {
        navigation.navigate('Login' as never);
      }
      // Customer is already logged in - no action needed
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Box Bus for fast delivery</Text>
      </View>

      <View style={styles.form}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your full address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            autoCapitalize="words"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.userType === 'customer' && styles.userTypeButtonSelected
              ]}
              onPress={() => handleInputChange('userType', 'customer')}
            >
              <Text style={[
                styles.userTypeText,
                formData.userType === 'customer' && styles.userTypeTextSelected
              ]}>
                Customer
              </Text>
              <Text style={styles.userTypeDescription}>
                Place delivery orders
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.userType === 'driver' && styles.userTypeButtonSelected
              ]}
              onPress={() => handleInputChange('userType', 'driver')}
            >
              <Text style={[
                styles.userTypeText,
                formData.userType === 'driver' && styles.userTypeTextSelected
              ]}>
                Driver
              </Text>
              <Text style={styles.userTypeDescription}>
                Deliver packages (requires approval)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.registerButtonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
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
  form: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#00d4aa',
  },
  textArea: {
    height: 80,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  userTypeButtonSelected: {
    borderColor: '#00d4aa',
    backgroundColor: '#0f3460',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userTypeTextSelected: {
    color: '#00d4aa',
  },
  userTypeDescription: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
  },
  loginLinkText: {
    color: '#00d4aa',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
});

export default RegisterScreen;