/**
 * Settings Screen with Farm Switcher
 */

import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clearAuth, getCurrentFarmId, setCurrentFarmId } from '../../lib/auth';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
  const [currentFarm, setCurrentFarm] = useState<string>('');

  useEffect(() => {
    loadCurrentFarm();
  }, []);

  const loadCurrentFarm = async () => {
    const farmId = await getCurrentFarmId();
    setCurrentFarm(farmId || 'No farm selected');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAuth();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleSwitchFarm = () => {
    Alert.alert(
      'Switch Farm',
      'Select a farm to switch to:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Farm 1',
          onPress: async () => {
            await setCurrentFarmId('farm-1-id');
            setCurrentFarm('Farm 1');
          },
        },
        {
          text: 'Farm 2',
          onPress: async () => {
            await setCurrentFarmId('farm-2-id');
            setCurrentFarm('Farm 2');
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'farm',
      title: 'Current Farm',
      subtitle: currentFarm,
      icon: 'business',
      onPress: handleSwitchFarm,
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Edit your profile',
      icon: 'person',
      onPress: () => {},
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: 'English',
      icon: 'language',
      onPress: () => {},
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notifications',
      icon: 'notifications',
      onPress: () => {},
    },
    {
      id: 'sync',
      title: 'Sync Settings',
      subtitle: 'Auto-sync preferences',
      icon: 'sync',
      onPress: () => {},
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'Version 1.0.0',
      icon: 'information-circle',
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.settingsList}>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.settingItem}
            onPress={option.onPress}
          >
            <View style={styles.settingIcon}>
              <Ionicons name={option.icon as any} size={24} color="#0ea5e9" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{option.title}</Text>
              <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  settingsList: {
    backgroundColor: 'white',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    marginHorizontal: 12,
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

