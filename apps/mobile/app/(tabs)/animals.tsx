/**
 * Animals List Screen
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../../database/database';
import { Q } from '@nozbe/watermelondb';

export default function AnimalsScreen() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAnimals();
  }, [searchQuery]);

  const loadAnimals = async () => {
    const collection = database.get('animals');
    let query = collection.query(
      Q.where('deleted_at', null),
      Q.sortBy('tag_number', Q.asc)
    );

    if (searchQuery) {
      query = collection.query(
        Q.where('deleted_at', null),
        Q.where('tag_number', Q.like(`%${searchQuery}%`)),
        Q.sortBy('tag_number', Q.asc)
      );
    }

    const results = await query.fetch();
    setAnimals(results);
  };

  const renderAnimal = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.animalCard}
      onPress={() => router.push(`/animal/${item.id}`)}
    >
      <View style={styles.animalInfo}>
        <Text style={styles.tagNumber}>#{item.tagNumber}</Text>
        <Text style={styles.animalDetails}>
          {item.type} • {item.gender} • {item.breed || 'Unknown'}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#10b981';
      case 'SOLD':
        return '#6b7280';
      case 'DIED':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by tag number..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="numeric"
        />
      </View>

      {/* Animals List */}
      <FlatList
        data={animals}
        renderItem={renderAnimal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No animals found</Text>
            <Text style={styles.emptySubtext}>Add your first animal to get started</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: 12,
  },
  animalCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  animalInfo: {
    flex: 1,
  },
  tagNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  animalDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});

