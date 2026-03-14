import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function EmployeeDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = async () => {
    try {
      const res = await api.get(`/salary/summary/${user._id}`);
      setSummary(res.data);
    } catch (err) {
      // ignore
    }
  };

  useFocusEffect(useCallback(() => { loadSummary(); }, []));

  const onRefresh = async () => { setRefreshing(true); await loadSummary(); setRefreshing(false); };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>Employee</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {summary && (
        <>
          <View style={styles.salaryCard}>
            <Text style={styles.salaryTitle}>Monthly Salary</Text>
            <Text style={styles.salaryAmount}>₹{summary.monthlySalary}</Text>
            <Text style={styles.dailyRate}>₹{summary.dailySalary}/day</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.statNum}>{summary.currentMonth.presentDays}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.statNum}>{summary.currentMonth.absentDays}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Overall Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Earned</Text>
              <Text style={styles.summaryValue}>₹{summary.totalEarned}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Received</Text>
              <Text style={styles.summaryValue}>₹{summary.totalPaid}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[styles.summaryValue, { color: summary.balance >= 0 ? '#4CAF50' : '#E53935', fontSize: 20 }]}>
                {summary.balance >= 0 ? '+' : ''}₹{summary.balance}
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyAttendance')}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuTitle}>My Attendance</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MySalaryHistory')}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuTitle}>Salary History</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#4CAF50', padding: 24, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#C8E6C9', fontSize: 14 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role: { color: '#C8E6C9', fontSize: 13, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: '#fff', fontSize: 14 },
  salaryCard: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 20, alignItems: 'center', elevation: 2 },
  salaryTitle: { fontSize: 14, color: '#888' },
  salaryAmount: { fontSize: 32, fontWeight: 'bold', color: '#333', marginTop: 4 },
  dailyRate: { fontSize: 13, color: '#4CAF50', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  summaryCard: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  menu: { padding: 16, gap: 10 },
  menuItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  menuIcon: { fontSize: 22, marginRight: 14 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  arrow: { fontSize: 24, color: '#CCC' }
});
