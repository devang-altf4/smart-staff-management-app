import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function RecordPaymentScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get(`/salary/summary/${userId}`);
        setSummary(res.data);
        // Pre-fill amount with the auto-calculated payable amount
        setAmount(res.data.currentMonth.earnedSalary.toString());
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch salary data');
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, [userId]);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      await api.post('/salary/payment', {
        userId,
        amount: parseFloat(amount),
        note: note || 'Salary payment'
      });
      Alert.alert('Success', 'Payment recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingSummary) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Process Salary</Text>
        <Text style={styles.subtitle}>For: {userName}</Text>

        {summary && (
          <View style={styles.statsBox}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Monthly Salary</Text>
              <Text style={styles.statValue}>₹{summary.monthlySalary}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Month Absences</Text>
              <Text style={[styles.statValue, { color: '#E53935' }]}>{summary.currentMonth.absentDays} days</Text>
            </View>
            {summary.currentMonth.absentDays > 5 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Deducted (>{5} absences)</Text>
                <Text style={styles.statValue}>-₹{Math.round((summary.currentMonth.absentDays - 5) * summary.dailySalary)}</Text>
              </View>
            )}
            <View style={[styles.statRow, styles.totalRow]}>
              <Text style={styles.statLabelTotal}>Payable Amount</Text>
              <Text style={styles.statValueTotal}>₹{summary.currentMonth.earnedSalary}</Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>Amount to Pay (₹) *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter amount" 
          value={amount} 
          onChangeText={setAmount} 
          keyboardType="numeric" 
        />

        <Text style={styles.label}>Note</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. March 2026 Salary" 
          value={note} 
          onChangeText={setNote} 
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Salary</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  statsBox: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEE' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 14, color: '#555' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#DDD' },
  statLabelTotal: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statValueTotal: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  label: { fontSize: 14, color: '#666', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 14, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#4A90D9', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
