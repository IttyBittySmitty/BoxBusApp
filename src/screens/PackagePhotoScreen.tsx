import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface PackagePhoto {
  id: string;
  orderId: string;
  photoUrl: string;
  description: string;
  uploadedAt: Date;
  packageNumber: number;
}

export default function PackagePhotoScreen() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PackagePhoto[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'manage'>('upload');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [packageNumber, setPackageNumber] = useState('1');

  // Mock orders for demo purposes
  const mockOrders = [
    { id: 'BB12345678', status: 'PENDING', pickupAddress: '123 Main St, Toronto' },
    { id: 'BB87654321', status: 'CONFIRMED', pickupAddress: '789 Pine St, Toronto' },
    { id: 'BB11223344', status: 'ASSIGNED', pickupAddress: '555 Commerce Blvd, Toronto' },
  ];

  const handlePhotoUpload = () => {
    if (!selectedOrderId) {
      Alert.alert('Error', 'Please select an order first');
      return;
    }

    if (!photoDescription.trim()) {
      Alert.alert('Error', 'Please add a description for the photo');
      return;
    }

    // Placeholder: In production, this would upload to your backend/storage
    const newPhoto: PackagePhoto = {
      id: Date.now().toString(),
      orderId: selectedOrderId,
      photoUrl: 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Package+Photo',
      description: photoDescription.trim(),
      uploadedAt: new Date(),
      packageNumber: parseInt(packageNumber),
    };

    setPhotos([...photos, newPhoto]);
    setPhotoDescription('');
    setPackageNumber('1');
    
    Alert.alert('Success', 'Photo uploaded successfully!');
  };

  const handlePhotoDelete = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhotos(photos.filter(photo => photo.id !== photoId));
            Alert.alert('Success', 'Photo deleted successfully!');
          },
        },
      ]
    );
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#ff9500';
      case 'CONFIRMED': return '#007AFF';
      case 'ASSIGNED': return '#34c759';
      case 'IN_TRANSIT': return '#5856d6';
      case 'DELIVERED': return '#28a745';
      default: return '#666';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳ Pending';
      case 'CONFIRMED': return '✅ Confirmed';
      case 'ASSIGNED': return '🚛 Assigned';
      case 'IN_TRANSIT': return '🚚 In Transit';
      case 'DELIVERED': return '📦 Delivered';
      default: return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Package Photos</Text>
      <Text style={styles.subtitle}>Upload and manage photos of your packages</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
            📸 Upload
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
          onPress={() => setActiveTab('gallery')}
        >
          <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>
            🖼️ Gallery
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabText, activeTab === 'manage' && styles.activeTabText]}>
            ⚙️ Manage
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'upload' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Package Photo</Text>
          
          {/* Order Selection */}
          <View style={styles.orderSelection}>
            <Text style={styles.inputLabel}>Select Order:</Text>
            <View style={styles.orderList}>
              {mockOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={[
                    styles.orderItem,
                    selectedOrderId === order.id && styles.selectedOrderItem
                  ]}
                  onPress={() => setSelectedOrderId(order.id)}
                >
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>📦 {order.id}</Text>
                    <Text style={styles.orderAddress}>{order.pickupAddress}</Text>
                  </View>
                  <View style={[
                    styles.orderStatus,
                    { backgroundColor: getOrderStatusColor(order.status) }
                  ]}>
                    <Text style={styles.orderStatusText}>
                      {getOrderStatusText(order.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Package Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Package Number:</Text>
            <TextInput
              style={styles.textInput}
              value={packageNumber}
              onChangeText={setPackageNumber}
              placeholder="1"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Photo Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Photo Description:</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={photoDescription}
              onChangeText={setPhotoDescription}
              placeholder="Describe what's in this package..."
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.characterCount}>
              {photoDescription.length}/200 characters
            </Text>
          </View>

          {/* Photo Upload Placeholder */}
          <View style={styles.photoUploadArea}>
            <Text style={styles.photoUploadText}>📸 Tap to Upload Photo</Text>
            <Text style={styles.photoUploadSubtext}>
              In production, this would open camera/gallery
            </Text>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedOrderId || !photoDescription.trim()) && styles.submitButtonDisabled
            ]}
            onPress={handlePhotoUpload}
            disabled={!selectedOrderId || !photoDescription.trim()}
          >
            <Text style={styles.submitButtonText}>Upload Photo</Text>
          </TouchableOpacity>

          {/* Upload Tips */}
          <View style={styles.uploadTips}>
            <Text style={styles.uploadTipsTitle}>💡 Photo Upload Tips</Text>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>
                • <Text style={styles.tipHighlight}>Clear Photos:</Text> Ensure good lighting and clear visibility
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>
                • <Text style={styles.tipHighlight}>Package Contents:</Text> Show what's inside for better tracking
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipText}>
                • <Text style={styles.tipHighlight}>Multiple Angles:</Text> Upload photos from different sides if needed
              </Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'gallery' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Gallery</Text>
          
          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>📸 No Photos Yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Upload your first package photo to get started
              </Text>
            </View>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.photoUrl }} style={styles.photoImage} />
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoOrderId}>📦 {photo.orderId}</Text>
                    <Text style={styles.photoDescription}>{photo.description}</Text>
                    <Text style={styles.photoDetails}>
                      Package {photo.packageNumber} • {photo.uploadedAt.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {activeTab === 'manage' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Photos</Text>
          
          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>📸 No Photos to Manage</Text>
              <Text style={styles.emptyStateSubtext}>
                Upload some photos first to manage them here
              </Text>
            </View>
          ) : (
            <View style={styles.manageList}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.manageItem}>
                  <Image source={{ uri: photo.photoUrl }} style={styles.manageThumbnail} />
                  
                  <View style={styles.manageInfo}>
                    <Text style={styles.manageOrderId}>📦 {photo.orderId}</Text>
                    <Text style={styles.manageDescription}>{photo.description}</Text>
                    <Text style={styles.manageDetails}>
                      Package {photo.packageNumber} • {photo.uploadedAt.toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.manageActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => Alert.alert('Edit', 'Edit functionality would go here')}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handlePhotoDelete(photo.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Bulk Actions */}
          {photos.length > 0 && (
            <View style={styles.bulkActions}>
              <Text style={styles.bulkActionsTitle}>Bulk Actions</Text>
              
              <View style={styles.bulkButtons}>
                <TouchableOpacity
                  style={styles.bulkButton}
                  onPress={() => Alert.alert('Export', 'Export functionality would go here')}
                >
                  <Text style={styles.bulkButtonText}>📤 Export All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.bulkButton}
                  onPress={() => Alert.alert('Delete All', 'Delete all functionality would go here')}
                >
                  <Text style={styles.bulkButtonText}>🗑️ Delete All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>📸 Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>🖼️ View Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>📤 Share Photos</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
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
  orderSelection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderList: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  selectedOrderItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  orderStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  photoUploadArea: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginBottom: 24,
  },
  photoUploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  photoUploadSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  uploadTips: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
  },
  uploadTipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipItem: {
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipHighlight: {
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  photoGrid: {
    gap: 16,
  },
  photoCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  photoImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoInfo: {
    padding: 16,
  },
  photoOrderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  photoDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  photoDetails: {
    fontSize: 12,
    color: '#666',
  },
  manageList: {
    gap: 16,
  },
  manageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  manageThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  manageInfo: {
    flex: 1,
  },
  manageOrderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  manageDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  manageDetails: {
    fontSize: 12,
    color: '#666',
  },
  manageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bulkActions: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bulkActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bulkButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});


