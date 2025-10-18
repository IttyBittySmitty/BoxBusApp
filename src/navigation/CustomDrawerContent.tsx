import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';

interface CustomDrawerContentProps {
  state: any;
  navigation: any;
  descriptors: any;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
  state,
  navigation,
  descriptors,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>
            {`${user?.firstName?.charAt(0) || 'D'}${user?.lastName?.charAt(0) || 'U'}`}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userType}>
          {user?.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : 'Customer'}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Navigation Items */}
      <DrawerContentScrollView style={styles.drawerScroll}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.drawerLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'drawerItemPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <DrawerItem
              key={route.key}
              label={label}
              onPress={onPress}
              activeTintColor="#00d4aa"
              inactiveTintColor="#ffffff"
              style={[
                styles.drawerItem,
                isFocused && styles.activeDrawerItem
              ]}
              labelStyle={[
                styles.drawerLabel,
                isFocused && styles.activeDrawerLabel
              ]}
            />
          );
        })}
      </DrawerContentScrollView>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  userSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#16213e',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00d4aa',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 5,
  },
  userType: {
    fontSize: 12,
    color: '#00d4aa',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    backgroundColor: '#0f3460',
    height: 1,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerItem: {
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 8,
  },
  activeDrawerItem: {
    backgroundColor: '#0f3460',
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeDrawerLabel: {
    fontWeight: 'bold',
  },
  logoutSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#0f3460',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f3460',
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
});

export default CustomDrawerContent;
