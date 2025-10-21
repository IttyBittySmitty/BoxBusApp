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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const AdminLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userType: 'customer' | 'driver' | 'admin') => {
    switch (userType) {
      case 'customer':
        setEmail('smitty@boxbus.com');
        setPassword('1234');
        break;
      case 'driver':
        setEmail('smittydriver@boxbus.ca');
        setPassword('1234');
        break;
      case 'admin':
        setEmail('admin@boxbus.com');
        setPassword('admin123');
        break;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>BoxBus Admin</Text>
          <Text style={styles.subtitle}>System Management Portal</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickLogin}>
          <Text style={styles.quickLoginTitle}>Quick Login (Testing)</Text>
          
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickLogin('customer')}
          >
            <Text style={styles.quickButtonText}>👤 Customer Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickLogin('driver')}
          >
            <Text style={styles.quickButtonText}>🚚 Driver Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.adminButton]}
            onPress={() => handleQuickLogin('admin')}
          >
            <Text style={[styles.quickButtonText, styles.adminButtonText]}>👑 Admin Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00d4aa',
  },
  loginButton: {
    backgroundColor: '#00d4aa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#666',
  },
  loginButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickLogin: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
  },
  quickLoginTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#00d4aa',
  },
  quickButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  adminButtonText: {
    color: '#1a1a2e',
  },
});

export default AdminLoginScreen;
