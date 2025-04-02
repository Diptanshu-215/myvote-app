import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface VoterRegistration {
  id: string;
  name: string;
  email: string;
  idNumber: string;
  dateSubmitted: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<VoterRegistration[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      idNumber: 'ID12345678',
      dateSubmitted: 'June 10, 2024',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      idNumber: 'ID87654321',
      dateSubmitted: 'June 11, 2024',
      status: 'pending',
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      idNumber: 'ID13579246',
      dateSubmitted: 'June 9, 2024',
      status: 'approved',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      idNumber: 'ID24681357',
      dateSubmitted: 'June 8, 2024',
      status: 'rejected',
    },
  ]);

  const filteredRegistrations = registrations.filter(reg => reg.status === activeTab);

  const handleApprove = (id: string) => {
    Alert.alert(
      "Confirm Approval",
      "Are you sure you want to approve this voter registration? This will write the data to the blockchain.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Approve", 
          onPress: () => {
            setLoading(true);
            // Simulate blockchain transaction
            setTimeout(() => {
              setRegistrations(prev => 
                prev.map(reg => 
                  reg.id === id ? { ...reg, status: 'approved' } : reg
                )
              );
              setLoading(false);
              Alert.alert("Success", "Voter registration has been approved and recorded on the blockchain.");
            }, 2000);
          } 
        }
      ]
    );
  };

  const handleReject = (id: string) => {
    Alert.alert(
      "Confirm Rejection",
      "Are you sure you want to reject this voter registration?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reject", 
          style: "destructive",
          onPress: () => {
            setLoading(true);
            // Simulate blockchain transaction
            setTimeout(() => {
              setRegistrations(prev => 
                prev.map(reg => 
                  reg.id === id ? { ...reg, status: 'rejected' } : reg
                )
              );
              setLoading(false);
              Alert.alert("Success", "Voter registration has been rejected.");
            }, 1500);
          } 
        }
      ]
    );
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const renderItem = ({ item }: { item: VoterRegistration }) => (
    <Animated.View 
      entering={FadeInDown}
      style={styles.registrationCard}
    >
      <View style={styles.registrationHeader}>
        <View>
          <Text style={styles.registrationName}>{item.name}</Text>
          <Text style={styles.registrationDate}>Submitted: {item.dateSubmitted}</Text>
        </View>
        
        {activeTab === 'pending' && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
        
        {activeTab === 'approved' && (
          <View style={styles.approvedBadge}>
            <Text style={styles.approvedText}>Approved</Text>
          </View>
        )}
        
        {activeTab === 'rejected' && (
          <View style={styles.rejectedBadge}>
            <Text style={styles.rejectedText}>Rejected</Text>
          </View>
        )}
      </View>
      
      <View style={styles.registrationBody}>
        <View style={styles.registrationInfo}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{item.email}</Text>
        </View>
        
        <View style={styles.registrationInfo}>
          <Text style={styles.infoLabel}>ID Number:</Text>
          <Text style={styles.infoValue}>{item.idNumber}</Text>
        </View>
      </View>
      
      {activeTab === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
            disabled={loading}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
            disabled={loading}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#3949ab', '#1e3a8a']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headerSubtitle}>Manage Voter Registrations</Text>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pending
            </Text>
            {registrations.filter(r => r.status === 'pending').length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {registrations.filter(r => r.status === 'pending').length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
            onPress={() => setActiveTab('approved')}
          >
            <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
              Approved
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rejected' && styles.activeTab]}
            onPress={() => setActiveTab('rejected')}
          >
            <Text style={[styles.tabText, activeTab === 'rejected' && styles.activeTabText]}>
              Rejected
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Processing Blockchain Transaction...</Text>
        </View>
      )}
      
      <FlatList
        data={filteredRegistrations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No {activeTab} registrations found</Text>
          </View>
        }
      />
      
      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{registrations.filter(r => r.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{registrations.filter(r => r.status === 'approved').length}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{registrations.filter(r => r.status === 'rejected').length}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#3949ab',
  },
  badge: {
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  listContent: {
    padding: 16,
  },
  registrationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  registrationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  registrationDate: {
    fontSize: 14,
    color: '#666',
  },
  pendingBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  pendingText: {
    color: '#F57F17',
    fontWeight: '600',
  },
  approvedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  approvedText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  rejectedText: {
    color: '#C62828',
    fontWeight: '600',
  },
  registrationBody: {
    padding: 16,
  },
  registrationInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  rejectButtonText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },
}); 