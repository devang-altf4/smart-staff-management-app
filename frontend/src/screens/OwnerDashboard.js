import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OwnerDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalStaff: 0, managers: 0, employees: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const staffRes = await api.get('/staff');
      const staff = staffRes.data;
      setStats({
        totalStaff: staff.length,
        managers: staff.filter(s => s.role === 'manager').length,
        employees: staff.filter(s => s.role === 'employee').length,
      });
    } catch (err) {
      // ignore
    }
  };

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const menuItems = [
    { title: 'Add Staff', icon: '👤+', screen: 'AddStaff', color: '#4CAF50' },
    { title: 'Staff List', icon: '👥', screen: 'StaffList', color: '#2196F3' },
    { title: 'Attendance', icon: '📋', screen: 'Attendance', color: '#FF9800' },
    { title: 'Process Salaries', icon: '💸', screen: 'StaffList', color: '#E91E63' },
    { title: 'Salary History', icon: '📊', screen: 'SalaryHistoryList', color: '#9C27B0' },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>Owner</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.statNum}>{stats.totalStaff}</Text>
          <Text style={styles.statLabel}>Total Staff</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statNum}>{stats.managers}</Text>
          <Text style={styles.statLabel}>Managers</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.statNum}>{stats.employees}</Text>
          <Text style={styles.statLabel}>Employees</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuItem, { borderLeftColor: item.color }]} onPress={() => navigation.navigate(item.screen)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#4A90D9', padding: 24, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#E0E0E0', fontSize: 14 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role: { color: '#B3D4FC', fontSize: 13, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: '#fff', fontSize: 14 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  menu: { padding: 16, gap: 12 },
  menuItem: { backgroundColor: '#fff', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, borderLeftWidth: 4 },
  menuIcon: { fontSize: 24, marginRight: 14 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  arrow: { fontSize: 24, color: '#CCC' }
});
