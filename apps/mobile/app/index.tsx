import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmy Mobile App</Text>
      <Text style={styles.subtitle}>Farm Management System</Text>
      <View style={styles.list}>
        <Text style={styles.listItem}>✅ Monorepo structure created</Text>
        <Text style={styles.listItem}>✅ Shared packages configured</Text>
        <Text style={styles.listItem}>⏳ Expo app ready for development</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  list: {
    alignItems: 'flex-start',
  },
  listItem: {
    fontSize: 14,
    marginVertical: 5,
  },
});

