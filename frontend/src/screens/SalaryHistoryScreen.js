import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import api from '../services/api';

export default function SalaryHistoryScreen({ route }) {
  const { userId, userName } = route.params;
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyRes, summaryRes] = await Promise.all([
        api.get(`/salary/history/${userId}`),
        api.get(`/salary/summary/${userId}`)
      ]);
      setPayments(historyRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.amount}>₹{item.amount}</Text>
          <Text style={styles.note}>{item.note || 'Payment'}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{userName}'s Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>₹{summary.totalEarned}</Text>
              <Text style={styles.summaryLabel}>Total Earned</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>₹{summary.totalPaid}</Text>
              <Text style={styles.summaryLabel}>Total Paid</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: summary.balance >= 0 ? '#4CAF50' : '#E53935' }]}>
                {summary.balance >= 0 ? '+' : ''}₹{summary.balance}
              </Text>
              <Text style={styles.summaryLabel}>Balance</Text>
            </View>
          </View>
        </View>
      )}
      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No payment records</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  summaryCard: { backgroundColor: '#4A90D9', margin: 16, borderRadius: 12, padding: 20 },
  summaryTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center' },
  summaryNum: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  summaryLabel: { color: '#B3D4FC', fontSize: 11, marginTop: 4 },
  list: { paddingHorizontal: 16, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  note: { fontSize: 12, color: '#888', marginTop: 2 },
  date: { fontSize: 13, color: '#999' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 }
});
