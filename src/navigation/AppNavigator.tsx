import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Navigation
import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <Text style={{ color: '#ffffff', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : (
        // Use drawer navigation for all authenticated users
        <DrawerNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
