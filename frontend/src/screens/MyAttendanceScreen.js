import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MyAttendanceScreen() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const now = new Date();
      const res = await api.get(`/attendance/user/${user._id}?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      setAttendance(res.data);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.date}>{item.date}</Text>
      <View style={[styles.badge, { backgroundColor: item.status === 'present' ? '#E8F5E9' : '#FFEBEE' }]}>
        <Text style={[styles.badgeText, { color: item.status === 'present' ? '#2E7D32' : '#C62828' }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#4CAF50' }]}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#E53935' }]}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{attendance.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>
      <FlatList
        data={attendance}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No attendance records this month</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  summary: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, justifyContent: 'space-around', elevation: 2 },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  summaryLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  list: { padding: 16, gap: 8 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  date: { fontSize: 15, fontWeight: '500', color: '#333' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 }
});
