import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // History Modal State
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffHistory, setStaffHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Date Navigation State
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const changeDate = (offset) => {
    const [year, month, day] = selectedDate.split('-');
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + offset);
    const newDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(newDateStr);
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, month - 1, day);
    return d.toDateString();
  };

  const loadData = async () => {
    try {
      const [staffRes, attendanceRes] = await Promise.all([
        api.get('/staff'),
        api.get(`/attendance/date/${selectedDate}`)
      ]);
      setStaff(staffRes.data.filter(s => s.role !== 'owner'));
      const attMap = {};
      attendanceRes.data.forEach(a => { attMap[a.user._id || a.user] = a.status; });
      setTodayAttendance(attMap);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, [selectedDate]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleAttendance = (userId) => {
    setTodayAttendance(prev => {
      const current = prev[userId];
      let next;
      if (!current) next = 'present';
      else if (current === 'present') next = 'absent';
      else next = 'present';
      return { ...prev, [userId]: next };
    });
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(todayAttendance).map(([userId, status]) => ({ userId, status }));
      if (records.length === 0) {
        Alert.alert('Info', 'No attendance to save');
        setSaving(false);
        return;
      }
      await api.post('/attendance/bulk', { date: selectedDate, records });
      Alert.alert('Success', `Attendance saved for ${formatDate(selectedDate)}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (staffMember) => {
    setSelectedStaff(staffMember);
    setHistoryModalVisible(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/attendance/user/${staffMember._id}`);
      setStaffHistory(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load history: ' + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const status = todayAttendance[item._id];
    return (
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardMain} onPress={() => toggleAttendance(item._id)}>
          <View style={[styles.avatar, { backgroundColor: item.role === 'manager' ? '#FF9800' : '#4CAF50' }]}>
            <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: status === 'present' ? '#E8F5E9' : status === 'absent' ? '#FFEBEE' : '#F5F5F5'
            }
          ]}>
            <Text style={[
              styles.statusText,
              {
                color: status === 'present' ? '#2E7D32' : status === 'absent' ? '#C62828' : '#999'
              }
            ]}>
              {status ? status.toUpperCase() : 'TAP'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.historyBtn} onPress={() => openHistory(item)}>
          <Text style={styles.historyBtnText}>View History</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel}>📅 {formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Tap to toggle: Present / Absent</Text>
      </View>
      <FlatList
        data={staff}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No staff members</Text>}
      />
      <TouchableOpacity style={styles.saveBtn} onPress={saveAttendance} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Attendance'}</Text>
      </TouchableOpacity>

      <Modal
        visible={historyModalVisible}
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedStaff ? `${selectedStaff.name}'s History` : 'History'}
            </Text>
            <TouchableOpacity onPress={() => setHistoryModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          {historyLoading ? (
            <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={staffHistory}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.historyList}
              ListEmptyComponent={<Text style={styles.empty}>No attendance records found</Text>}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <Text style={styles.historyDate}>{new Date(item.date).toDateString()}</Text>
                  <View style={[
                    styles.historyBadge,
                    { backgroundColor: item.status === 'present' ? '#E8F5E9' : '#FFEBEE' }
                  ]}>
                    <Text style={[
                      styles.historyBadgeText,
                      { color: item.status === 'present' ? '#2E7D32' : '#C62828' }
                    ]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  dateNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  arrowBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F5F5F5', borderRadius: 8 },
  arrowText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  dateLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  hint: { fontSize: 12, color: '#999', textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, elevation: 2, marginBottom: 10, overflow: 'hidden' },
  cardMain: { padding: 14, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  role: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  historyBtn: { borderTopWidth: 1, borderTopColor: '#EEE', paddingVertical: 10, alignItems: 'center', backgroundColor: '#FAFAFA' },
  historyBtnText: { color: '#4A90D9', fontSize: 13, fontWeight: '600' },
  saveBtn: { backgroundColor: '#4A90D9', margin: 16, padding: 16, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeBtn: { padding: 8 },
  closeBtnText: { color: '#4A90D9', fontSize: 16, fontWeight: '600' },
  historyList: { padding: 16, gap: 10 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, elevation: 1 },
  historyDate: { fontSize: 16, color: '#333', fontWeight: '500' },
  historyBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  historyBadgeText: { fontSize: 12, fontWeight: 'bold' }
});
