import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ManagerDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const perms = user?.permissions || {};

  const menuItems = [];
  if (perms.markAttendance) {
    menuItems.push({ title: 'Mark Attendance', icon: '📋', screen: 'Attendance', color: '#FF9800' });
  }
  if (perms.viewStaffList) {
    menuItems.push({ title: 'Staff List', icon: '👥', screen: 'StaffList', color: '#2196F3' });
  }
  if (perms.recordSalaryPayments) {
    menuItems.push({ title: 'Record Payment', icon: '💰', screen: 'SalaryHistoryList', color: '#9C27B0' });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>Manager</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {menuItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyText}>No permissions assigned yet.</Text>
          <Text style={styles.emptySubtext}>Ask the owner to assign permissions.</Text>
        </View>
      ) : (
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, { borderLeftColor: item.color }]} onPress={() => navigation.navigate(item.screen)}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FF9800', padding: 24, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#FFE0B2', fontSize: 14 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role: { color: '#FFE0B2', fontSize: 13, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: '#fff', fontSize: 14 },
  menu: { padding: 16, gap: 12 },
  menuItem: { backgroundColor: '#fff', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', elevation: 2, borderLeftWidth: 4 },
  menuIcon: { fontSize: 24, marginRight: 14 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  arrow: { fontSize: 24, color: '#CCC' },
  emptyBox: { alignItems: 'center', marginTop: 60, padding: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 8 }
});
