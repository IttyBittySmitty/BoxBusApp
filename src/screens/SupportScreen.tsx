import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  orderId?: string;
  attachments?: string[];
}

export default function SupportScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isNewTicketModalVisible, setIsNewTicketModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isTicketDetailModalVisible, setIsTicketDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'tickets' | 'faq' | 'contact'>('tickets');

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as const,
    category: 'general',
    orderId: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    // Placeholder: In production, this would fetch from your backend
    const mockTickets: SupportTicket[] = [
      {
        id: 'ticket1',
        subject: 'Delivery Delay Issue',
        description: 'My order was supposed to be delivered yesterday but still shows as in transit.',
        priority: 'high',
        status: 'in-progress',
        category: 'delivery',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-16'),
        orderId: 'BB12345678',
      },
      {
        id: 'ticket2',
        subject: 'Pricing Question',
        description: 'I noticed the delivery fee seems higher than quoted. Can you explain the breakdown?',
        priority: 'medium',
        status: 'open',
        category: 'billing',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
      },
    ];
    setTickets(mockTickets);
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const ticket: SupportTicket = {
      id: `ticket${Date.now()}`,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'open',
      category: newTicket.category,
      createdAt: new Date(),
      updatedAt: new Date(),
      orderId: newTicket.orderId || undefined,
    };

    setTickets(prev => [ticket, ...prev]);
    setIsNewTicketModalVisible(false);
    
    // Reset form
    setNewTicket({
      subject: '',
      description: '',
      priority: 'medium',
      category: 'general',
      orderId: '',
    });

    Alert.alert('Success', 'Support ticket created successfully. We will respond within 24 hours.');
  };

  const openEmailSupport = () => {
    const subject = encodeURIComponent('BoxBus Support Request');
    const body = encodeURIComponent(`
Hello BoxBus Support Team,

I need assistance with the following:

[Please describe your issue here]

Order ID (if applicable): 
Priority Level: 
Category: 

Thank you,
${user?.name || 'Customer'}
    `);
    
    const mailtoUrl = `mailto:support@boxbus.com?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(mailtoUrl).then(supported => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Error', 'Email app not found. Please email support@boxbus.com directly.');
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#007bff';
      case 'in-progress': return '#fd7e14';
      case 'resolved': return '#28a745';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'delivery', label: 'Delivery Issue' },
    { value: 'billing', label: 'Billing & Payment' },
    { value: 'account', label: 'Account Issue' },
    { value: 'technical', label: 'Technical Problem' },
    { value: 'feedback', label: 'Feedback & Suggestion' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const faqs = [
    {
      question: 'How do I track my delivery?',
      answer: 'You can track your delivery in real-time through the "My Orders" section. You\'ll receive updates via email and push notifications.',
    },
    {
      question: 'What are your delivery windows?',
      answer: 'We offer Next Day (48 hours), Same Day (by 9 PM, order by 9 AM, +25%), and Rush (2-hour window, order by 7 PM, +75%).',
    },
    {
      question: 'How is pricing calculated?',
      answer: 'Base delivery is $15, plus distance fees ($0.75/km over 15km), weight fees ($0.25/lb over 25lbs with scaling reduction), and package fees ($2 per additional package). GST is 5%.',
    },
    {
      question: 'What if my package is damaged?',
      answer: 'All deliveries include $1000 insurance coverage. Report damage within 24 hours of delivery for claims processing.',
    },
    {
      question: 'Can I change my delivery address?',
      answer: 'Address changes can be made up to 2 hours before pickup. Contact support for urgent changes.',
    },
    {
      question: 'Do you deliver on weekends?',
      answer: 'Weekend delivery is available for an additional fee. Check with your driver for availability.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customer Support</Text>
      <Text style={styles.subtitle}>We're here to help with any questions or issues</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>
            🎫 My Tickets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
          onPress={() => setActiveTab('faq')}
        >
          <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
            ❓ FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
            📧 Contact
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'tickets' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Support Tickets</Text>
            <TouchableOpacity 
              style={styles.newTicketButton}
              onPress={() => setIsNewTicketModalVisible(true)}
            >
              <Text style={styles.newTicketButtonText}>🆕 New Ticket</Text>
            </TouchableOpacity>
          </View>

          {tickets.length === 0 ? (
            <Text style={styles.noTicketsText}>
              No support tickets found. Create a new ticket if you need assistance.
            </Text>
          ) : (
            tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => {
                  setSelectedTicket(ticket);
                  setIsTicketDetailModalVisible(true);
                }}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                  <View style={styles.ticketBadges}>
                    <View style={[styles.badge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                      <Text style={styles.badgeText}>{getPriorityLabel(ticket.priority)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(ticket.status) }]}>
                      <Text style={styles.badgeText}>{getStatusLabel(ticket.status)}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.description}
                </Text>

                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketCategory}>📁 {ticket.category}</Text>
                  <Text style={styles.ticketDate}>
                    {ticket.createdAt.toLocaleDateString()}
                  </Text>
                </View>

                {ticket.orderId && (
                  <Text style={styles.ticketOrderId}>
                    📦 Order: {ticket.orderId}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {activeTab === 'faq' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>❓ {faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'contact' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactMethod}>
            <Text style={styles.contactTitle}>📧 Email Support</Text>
            <Text style={styles.contactDescription}>
              For immediate assistance, email us directly. We typically respond within 24 hours.
            </Text>
            <TouchableOpacity style={styles.emailButton} onPress={openEmailSupport}>
              <Text style={styles.emailButtonText}>✉️ Send Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactMethod}>
            <Text style={styles.contactTitle}>📱 Phone Support</Text>
            <Text style={styles.contactDescription}>
              Available Monday-Friday, 9 AM - 6 PM EST
            </Text>
            <Text style={styles.phoneNumber}>1-800-BOXBUS-1</Text>
          </View>

          <View style={styles.contactMethod}>
            <Text style={styles.contactTitle}>💬 Live Chat</Text>
            <Text style={styles.contactDescription}>
              Coming soon! We're working on real-time chat support.
            </Text>
            <TouchableOpacity style={styles.comingSoonButton} disabled>
              <Text style={styles.comingSoonButtonText}>🚧 Coming Soon</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactMethod}>
            <Text style={styles.contactTitle}>📍 Office Hours</Text>
            <Text style={styles.contactDescription}>
              Monday - Friday: 9:00 AM - 6:00 PM EST{'\n'}
              Saturday: 10:00 AM - 4:00 PM EST{'\n'}
              Sunday: Closed
            </Text>
          </View>
        </View>
      )}

      {/* New Ticket Modal */}
      <Modal
        visible={isNewTicketModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNewTicketModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Support Ticket</Text>
            
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of your issue"
              value={newTicket.subject}
              onChangeText={(value) => setNewTicket(prev => ({ ...prev, subject: value }))}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryOptions}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryOption,
                    newTicket.category === category.value && styles.selectedCategoryOption
                  ]}
                  onPress={() => setNewTicket(prev => ({ ...prev, category: category.value }))}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    newTicket.category === category.value && styles.selectedCategoryOptionText
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityOptions}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityOption,
                    newTicket.priority === priority.value && styles.selectedPriorityOption
                  ]}
                  onPress={() => setNewTicket(prev => ({ ...prev, priority: priority.value as any }))}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    newTicket.priority === priority.value && styles.selectedPriorityOptionText
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Order ID (if applicable)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., BB12345678"
              value={newTicket.orderId}
              onChangeText={(value) => setNewTicket(prev => ({ ...prev, orderId: value }))}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please provide detailed information about your issue..."
              value={newTicket.description}
              onChangeText={(value) => setNewTicket(prev => ({ ...prev, description: value }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsNewTicketModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={createTicket}
              >
                <Text style={styles.submitButtonText}>Submit Ticket</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        visible={isTicketDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTicketDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTicket && (
              <>
                <Text style={styles.modalTitle}>Ticket Details</Text>
                
                <View style={styles.ticketDetailHeader}>
                  <Text style={styles.ticketDetailSubject}>{selectedTicket.subject}</Text>
                  <View style={styles.ticketDetailBadges}>
                    <View style={[styles.badge, { backgroundColor: getPriorityColor(selectedTicket.priority) }]}>
                      <Text style={styles.badgeText}>{getPriorityLabel(selectedTicket.priority)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(selectedTicket.status) }]}>
                      <Text style={styles.badgeText}>{getStatusLabel(selectedTicket.status)}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.ticketDetailDescription}>{selectedTicket.description}</Text>
                
                <View style={styles.ticketDetailInfo}>
                  <Text style={styles.ticketDetailInfoText}>
                    📁 Category: {selectedTicket.category}
                  </Text>
                  <Text style={styles.ticketDetailInfoText}>
                    📅 Created: {selectedTicket.createdAt.toLocaleDateString()}
                  </Text>
                  <Text style={styles.ticketDetailInfoText}>
                    🔄 Updated: {selectedTicket.updatedAt.toLocaleDateString()}
                  </Text>
                  {selectedTicket.orderId && (
                    <Text style={styles.ticketDetailInfoText}>
                      📦 Order ID: {selectedTicket.orderId}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsTicketDetailModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  newTicketButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  newTicketButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  noTicketsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  ticketCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  ticketBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketCategory: {
    fontSize: 12,
    color: '#666',
  },
  ticketDate: {
    fontSize: 12,
    color: '#666',
  },
  ticketOrderId: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  faqItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactMethod: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  emailButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  emailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  comingSoonButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  comingSoonButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedCategoryOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  categoryOptionText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  selectedPriorityOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  priorityOptionText: {
    color: '#666',
    fontSize: 14,
  },
  selectedPriorityOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketDetailHeader: {
    marginBottom: 16,
  },
  ticketDetailSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ticketDetailBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketDetailDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 24,
  },
  ticketDetailInfo: {
    marginBottom: 20,
  },
  ticketDetailInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


