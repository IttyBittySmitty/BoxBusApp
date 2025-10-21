import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import DeliveryScreen from '../screens/DeliveryScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DriverDashboardScreen from '../screens/DriverDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ArchivedUsersScreen from '../screens/ArchivedUsersScreen';
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
  const { user } = useAuth();
  const isDriver = user?.userType === 'driver';
  const isAdmin = user?.userType === 'admin';

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
      {isAdmin ? (
        // Admin Screens
        <>
          {/* Admin Dashboard */}
          <Drawer.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{
              title: 'Admin Dashboard',
              drawerLabel: '👑 Admin Dashboard',
            }}
          />

          {/* Archive */}
          <Drawer.Screen
            name="Archive"
            component={ArchiveScreen}
            options={{
              title: 'Completed Orders',
              drawerLabel: '✅ Completed Orders',
            }}
          />

          {/* Archived Users */}
          <Drawer.Screen
            name="ArchivedUsers"
            component={ArchivedUsersScreen}
            options={{
              title: 'Archived Users',
              drawerLabel: '🗃️ Archived Users',
            }}
          />
        </>
      ) : isDriver ? (
        // Driver Screens
        <>
          {/* Driver Dashboard */}
          <Drawer.Screen
            name="DriverDashboard"
            component={DriverDashboardScreen}
            options={{
              title: 'Driver Dashboard',
              drawerLabel: '🚚 Dashboard',
            }}
          />
          
          {/* Driver Orders */}
          <Drawer.Screen
            name="Orders"
            component={OrdersScreen}
            options={{
              title: 'My Orders',
              drawerLabel: '📦 My Orders',
            }}
          />

          {/* Archive */}
          <Drawer.Screen
            name="Archive"
            component={ArchiveScreen}
            options={{
              title: 'Completed Orders',
              drawerLabel: '✅ Completed Orders',
            }}
          />
        </>
      ) : (
        // Customer Screens
        <>
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

          {/* Archive */}
          <Drawer.Screen
            name="Archive"
            component={ArchiveScreen}
            options={{
              title: 'Completed Orders',
              drawerLabel: '✅ Completed Orders',
            }}
          />
        </>
      )}

      {/* Profile - Common for both */}
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
