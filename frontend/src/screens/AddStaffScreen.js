import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Switch, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';

export default function AddStaffScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [role, setRole] = useState('employee');
  const [permissions, setPermissions] = useState({
    markAttendance: false,
    viewStaffList: false,
    recordSalaryPayments: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Name, phone and password are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/staff', {
        name,
        phone,
        password,
        monthlySalary: parseFloat(monthlySalary) || 0,
        role,
        permissions: role === 'manager' ? permissions : undefined,
        joiningDate: new Date().toISOString()
      });
      Alert.alert('Success', `${role === 'manager' ? 'Manager' : 'Employee'} added successfully`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Add New Staff</Text>

          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput style={styles.input} placeholder="Phone number (used for login)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.label}>Password *</Text>
          <TextInput style={styles.input} placeholder="Login password" value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.label}>Monthly Salary (₹)</Text>
          <TextInput style={styles.input} placeholder="e.g. 15000" value={monthlySalary} onChangeText={setMonthlySalary} keyboardType="numeric" />

          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'employee' && styles.roleBtnActive]}
              onPress={() => setRole('employee')}
            >
              <Text style={[styles.roleBtnText, role === 'employee' && styles.roleBtnTextActive]}>Employee</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'manager' && styles.roleBtnActive]}
              onPress={() => setRole('manager')}
            >
              <Text style={[styles.roleBtnText, role === 'manager' && styles.roleBtnTextActive]}>Manager</Text>
            </TouchableOpacity>
          </View>

          {role === 'manager' && (
            <View style={styles.permBox}>
              <Text style={styles.permTitle}>Manager Permissions</Text>
              {[
                { key: 'markAttendance', label: 'Mark Attendance' },
                { key: 'viewStaffList', label: 'View Staff List' },
                { key: 'recordSalaryPayments', label: 'Record Salary Payments' }
              ].map(perm => (
                <View key={perm.key} style={styles.permRow}>
                  <Text style={styles.permLabel}>{perm.label}</Text>
                  <Switch
                    value={permissions[perm.key]}
                    onValueChange={(val) => setPermissions(prev => ({ ...prev, [perm.key]: val }))}
                    trackColor={{ true: '#4A90D9' }}
                  />
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Staff</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, color: '#666', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: '#F9F9F9' },
  roleRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  roleBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', alignItems: 'center' },
  roleBtnActive: { borderColor: '#4A90D9', backgroundColor: '#E3F2FD' },
  roleBtnText: { fontSize: 16, color: '#888' },
  roleBtnTextActive: { color: '#4A90D9', fontWeight: 'bold' },
  permBox: { marginTop: 16, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16 },
  permTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  permLabel: { fontSize: 15, color: '#555' },
  button: { backgroundColor: '#4A90D9', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
