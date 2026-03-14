import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function SalaryHistoryListScreen({ navigation }) {
  const [staff, setStaff] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data.filter(s => s.role !== 'owner'));
    } catch (err) {
      // ignore
    }
  };

  useFocusEffect(useCallback(() => { loadStaff(); }, []));

  const onRefresh = async () => { setRefreshing(true); await loadStaff(); setRefreshing(false); };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SalaryHistory', { userId: item._id, userName: item.name })}>
      <View style={[styles.avatar, { backgroundColor: item.role === 'manager' ? '#FF9800' : '#4CAF50' }]}>
        <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.salary}>₹{item.monthlySalary}/mo</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={staff}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No staff members</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  salary: { fontSize: 12, color: '#888', marginTop: 2 },
  arrow: { fontSize: 24, color: '#CCC' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 }
});
