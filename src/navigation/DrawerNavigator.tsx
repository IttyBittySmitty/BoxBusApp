import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import DeliveryScreen from '../screens/DeliveryScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomerAnalyticsScreen from '../screens/CustomerAnalyticsScreen';
import PackagePhotoScreen from '../screens/PackagePhotoScreen';
import BusinessRegistrationScreen from '../screens/BusinessRegistrationScreen';
import SupportScreen from '../screens/SupportScreen';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

const CustomHeader = ({ navigation }: any) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>BoxBus</Text>
    <TouchableOpacity
      style={styles.menuButton}
      onPress={() => navigation.openDrawer()}
    >
      <Text style={styles.menuIcon}>☰</Text>
    </TouchableOpacity>
  </View>
);

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        header: ({ navigation }) => <CustomHeader navigation={navigation} />,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* New Delivery */}
      <Drawer.Screen
        name="NewDelivery"
        component={DeliveryScreen}
        options={{
          title: 'New Delivery',
          drawerLabel: '🚚 New Delivery',
        }}
      />
      
      {/* Orders */}
      <Drawer.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'My Orders',
          drawerLabel: '📦 My Orders',
        }}
      />

      {/* Analytics */}
      <Drawer.Screen
        name="CustomerAnalytics"
        component={CustomerAnalyticsScreen}
        options={{
          title: 'Analytics',
          drawerLabel: '📊 Analytics',
        }}
      />

      {/* Package Photos */}
      <Drawer.Screen
        name="PackagePhotos"
        component={PackagePhotoScreen}
        options={{
          title: 'Package Photos',
          drawerLabel: '📸 Package Photos',
        }}
      />

      {/* Business Registration */}
      <Drawer.Screen
        name="BusinessRegistration"
        component={BusinessRegistrationScreen}
        options={{
          title: 'Business Registration',
          drawerLabel: '🏢 Business Registration',
        }}
      />

      {/* Support */}
      <Drawer.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: 'Support',
          drawerLabel: '🆘 Support',
        }}
      />

      {/* Profile */}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          drawerLabel: '👤 Profile',
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
});
