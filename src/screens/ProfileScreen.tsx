import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = async () => {
    try {
      await updateUser(editData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleCancel = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.firstName}
                  onChangeText={(value) => setEditData({ ...editData, firstName: value })}
                  placeholder="First Name"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.lastName}
                  onChangeText={(value) => setEditData({ ...editData, lastName: value })}
                  placeholder="Last Name"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editData.phone}
                onChangeText={(value) => setEditData({ ...editData, phone: value })}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={editData.address}
                onChangeText={(value) => setEditData({ ...editData, address: value })}
                placeholder="Address"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Name:</Text>
              <Text style={styles.infoValue}>{user.firstName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Name:</Text>
              <Text style={styles.infoValue}>{user.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{user.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User Type:</Text>
              <Text style={styles.infoValue}>{user.userType || 'customer'}</Text>
            </View>
          </View>
        )}
      </View>



      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00d4aa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  section: {
    backgroundColor: '#16213e',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editButton: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  editForm: {
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 15,
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
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#00d4aa',
    padding: 12,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  infoContainer: {
    gap: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 100,
  },

});

export default ProfileScreen;

