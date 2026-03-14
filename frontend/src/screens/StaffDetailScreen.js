import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import api from '../services/api';

export default function StaffDetailScreen({ route, navigation }) {
  const { staffId } = route.params;
  const [staff, setStaff] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffRes, summaryRes] = await Promise.all([
        api.get(`/staff/${staffId}`),
        api.get(`/salary/summary/${staffId}`)
      ]);
      setStaff(staffRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (!staff) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: staff.role === 'manager' ? '#FF9800' : '#4CAF50' }]}>
          <Text style={styles.avatarText}>{staff.name[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{staff.name}</Text>
        <Text style={styles.role}>{staff.role.toUpperCase()}</Text>
        <Text style={styles.phone}>{staff.phone}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Monthly Salary</Text>
          <Text style={styles.infoValue}>₹{staff.monthlySalary}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Joining Date</Text>
          <Text style={styles.infoValue}>{new Date(staff.joiningDate).toLocaleDateString()}</Text>
        </View>
      </View>

      {summary && (
        <>
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Current Month Attendance</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Present Days</Text>
              <Text style={[styles.infoValue, { color: '#4CAF50' }]}>{summary.currentMonth.presentDays}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Absent Days</Text>
              <Text style={[styles.infoValue, { color: '#E53935' }]}>{summary.currentMonth.absentDays}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Earned This Month</Text>
              <Text style={styles.infoValue}>₹{summary.currentMonth.earnedSalary}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Salary Summary</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Earned</Text>
              <Text style={styles.infoValue}>₹{summary.totalEarned}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Paid</Text>
              <Text style={styles.infoValue}>₹{summary.totalPaid}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Balance</Text>
              <Text style={[styles.infoValue, { color: summary.balance >= 0 ? '#4CAF50' : '#E53935' }]}>
                {summary.balance >= 0 ? '+' : ''}₹{summary.balance}
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('SalaryHistory', { userId: staffId, userName: staff.name })}>
          <Text style={styles.actionText}>View Salary History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF9800' }]} onPress={() => navigation.navigate('RecordPayment', { userId: staffId, userName: staff.name })}>
          <Text style={styles.actionText}>Record Payment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loading: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
  profileCard: { backgroundColor: '#4A90D9', padding: 30, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role: { color: '#B3D4FC', fontSize: 13, marginTop: 4 },
  phone: { color: '#E0E0E0', fontSize: 14, marginTop: 4 },
  infoCard: { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  actions: { padding: 16, gap: 12 },
  actionBtn: { backgroundColor: '#4A90D9', padding: 16, borderRadius: 10, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
