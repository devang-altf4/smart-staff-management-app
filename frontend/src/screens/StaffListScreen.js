import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function StaffListScreen({ navigation }) {
  const [staff, setStaff] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStaff = async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  useFocusEffect(useCallback(() => { loadStaff(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
    setRefreshing(false);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Staff', `Are you sure you want to remove ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/staff/${item._id}`);
            loadStaff();
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('StaffDetail', { staffId: item._id })}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: item.role === 'manager' ? '#FF9800' : '#4CAF50' }]}>
          <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: item.role === 'manager' ? '#FFF3E0' : '#E8F5E9' }]}>
              <Text style={[styles.tagText, { color: item.role === 'manager' ? '#E65100' : '#2E7D32' }]}>
                {item.role.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.salary}>₹{item.monthlySalary}/mo</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={staff}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No staff members yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  phone: { fontSize: 13, color: '#888', marginTop: 2 },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: 'bold' },
  salary: { fontSize: 13, color: '#666' },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 18, color: '#E53935' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 }
});
