import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>📦</Text>
            <Text style={styles.logoTitle}>BoxBus</Text>
            <Text style={styles.logoSubtitle}>Fast & Reliable Delivery</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLinkText}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 80,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00d4aa',
    marginBottom: 5,
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
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
  loginButtonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    color: '#ffffff',
    fontSize: 16,
  },
  registerLinkText: {
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

export default LoginScreen;

