/**
 * Tasks/Reminders Screen
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../../database/database';
import { Q } from '@nozbe/watermelondb';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue'>('all');

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    const collection = database.get('reminders');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let query = collection.query(
      Q.where('completed', false),
      Q.where('deleted_at', null),
      Q.sortBy('due_date', Q.asc)
    );

    if (filter === 'today') {
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59);
      query = collection.query(
        Q.where('completed', false),
        Q.where('deleted_at', null),
        Q.where('due_date', Q.lte(endOfDay.getTime())),
        Q.sortBy('due_date', Q.asc)
      );
    } else if (filter === 'overdue') {
      query = collection.query(
        Q.where('completed', false),
        Q.where('deleted_at', null),
        Q.where('due_date', Q.lt(today.getTime())),
        Q.sortBy('due_date', Q.asc)
      );
    }

    const results = await query.fetch();
    setTasks(results);
  };

  const handleCompleteTask = async (task: any) => {
    Alert.alert(
      'Complete Task',
      'Mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await database.write(async () => {
              await task.update((record: any) => {
                record.completed = true;
                record.completedAt = new Date();
              });
            });
            loadTasks();
          },
        },
      ]
    );
  };

  const renderTask = ({ item }: { item: any }) => {
    const dueDate = new Date(item.dueDate);
    const isOverdue = dueDate < new Date();
    const isToday = dueDate.toDateString() === new Date().toDateString();

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.taskDescription}>{item.description}</Text>
            )}
            <Text style={[
              styles.taskDueDate,
              isOverdue && styles.overdue,
              isToday && styles.today,
            ]}>
              Due: {dueDate.toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteTask(item)}
          >
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'today' && styles.activeFilter]}
          onPress={() => setFilter('today')}
        >
          <Text style={[styles.filterText, filter === 'today' && styles.activeFilterText]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'overdue' && styles.activeFilter]}
          onPress={() => setFilter('overdue')}
        >
          <Text style={[styles.filterText, filter === 'overdue' && styles.activeFilterText]}>
            Overdue
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>All caught up!</Text>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#0ea5e9',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterText: {
    color: 'white',
  },
  listContent: {
    padding: 12,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  overdue: {
    color: '#ef4444',
    fontWeight: '600',
  },
  today: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  completeButton: {
    padding: 4,
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

