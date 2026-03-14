import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Owner Screens
import OwnerDashboard from '../screens/OwnerDashboard';
import AddStaffScreen from '../screens/AddStaffScreen';
import StaffListScreen from '../screens/StaffListScreen';
import StaffDetailScreen from '../screens/StaffDetailScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SalaryHistoryScreen from '../screens/SalaryHistoryScreen';
import SalaryHistoryListScreen from '../screens/SalaryHistoryListScreen';
import RecordPaymentScreen from '../screens/RecordPaymentScreen';

// Manager Screens
import ManagerDashboard from '../screens/ManagerDashboard';

// Employee Screens
import EmployeeDashboard from '../screens/EmployeeDashboard';
import MyAttendanceScreen from '../screens/MyAttendanceScreen';
import MySalaryHistoryScreen from '../screens/MySalaryHistoryScreen';

const Stack = createNativeStackNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: '#4A90D9' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' }
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function OwnerStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="OwnerHome" component={OwnerDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="AddStaff" component={AddStaffScreen} options={{ title: 'Add Staff' }} />
      <Stack.Screen name="StaffList" component={StaffListScreen} options={{ title: 'Staff List' }} />
      <Stack.Screen name="StaffDetail" component={StaffDetailScreen} options={{ title: 'Staff Details' }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} />
      <Stack.Screen name="SalaryHistoryList" component={SalaryHistoryListScreen} options={{ title: 'Salary History' }} />
      <Stack.Screen name="SalaryHistory" component={SalaryHistoryScreen} options={{ title: 'Payment History' }} />
      <Stack.Screen name="RecordPayment" component={RecordPaymentScreen} options={{ title: 'Process Salary' }} />
    </Stack.Navigator>
  );
}

function ManagerStack() {
  return (
    <Stack.Navigator screenOptions={{ ...headerStyle, headerStyle: { backgroundColor: '#FF9800' } }}>
      <Stack.Screen name="ManagerHome" component={ManagerDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Mark Attendance' }} />
      <Stack.Screen name="StaffList" component={StaffListScreen} options={{ title: 'Staff List' }} />
      <Stack.Screen name="SalaryHistoryList" component={SalaryHistoryListScreen} options={{ title: 'Salary History' }} />
      <Stack.Screen name="SalaryHistory" component={SalaryHistoryScreen} options={{ title: 'Payment History' }} />
      <Stack.Screen name="RecordPayment" component={RecordPaymentScreen} options={{ title: 'Process Salary' }} />
      <Stack.Screen name="StaffDetail" component={StaffDetailScreen} options={{ title: 'Staff Details' }} />
    </Stack.Navigator>
  );
}

function EmployeeStack() {
  return (
    <Stack.Navigator screenOptions={{ ...headerStyle, headerStyle: { backgroundColor: '#4CAF50' } }}>
      <Stack.Screen name="EmployeeHome" component={EmployeeDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="MyAttendance" component={MyAttendanceScreen} options={{ title: 'My Attendance' }} />
      <Stack.Screen name="MySalaryHistory" component={MySalaryHistoryScreen} options={{ title: 'Salary History' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4A90D9' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> :
        user.role === 'owner' ? <OwnerStack /> :
        user.role === 'manager' ? <ManagerStack /> :
        <EmployeeStack />
      }
    </NavigationContainer>
  );
}
