/**
 * Home Screen with Quick Action CTAs
 */

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { syncNow } from '../../lib/sync/engine';

export default function HomeScreen() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncNow();
    setSyncing(false);
    
    if (!result.success) {
      alert(`Sync failed: ${result.error}`);
    } else {
      alert('Sync completed successfully!');
    }
  };

  const quickActions = [
    {
      id: 'add-lambing',
      title: 'Add Lambing',
      icon: 'heart',
      color: '#ef4444',
      onPress: () => router.push('/record-lambing'),
    },
    {
      id: 'record-treatment',
      title: 'Record Treatment',
      icon: 'medical',
      color: '#f59e0b',
      onPress: () => router.push('/record-treatment'),
    },
    {
      id: 'add-weight',
      title: 'Add Weight',
      icon: 'scale',
      color: '#10b981',
      onPress: () => router.push('/record-weight'),
    },
    {
      id: 'record-milk',
      title: 'Record Milk',
      icon: 'water',
      color: '#3b82f6',
      onPress: () => router.push('/record-milk'),
    },
    {
      id: 'sell-animal',
      title: 'Sell Animal',
      icon: 'cash',
      color: '#8b5cf6',
      onPress: () => router.push('/record-sale'),
    },
    {
      id: 'sync-now',
      title: 'Sync Now',
      icon: 'sync',
      color: '#06b6d4',
      onPress: handleSync,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={syncing} onRefresh={handleSync} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to Farmy</Text>
        <Text style={styles.subtitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { backgroundColor: action.color }]}
            onPress={action.onPress}
            disabled={action.id === 'sync-now' && syncing}
          >
            <Ionicons name={action.icon as any} size={40} color="white" />
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Summary */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total Animals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Tasks Due</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Recent Events</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  actionCard: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

