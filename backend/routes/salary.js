const router = require('express').Router();
const SalaryPayment = require('../models/SalaryPayment');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Record cash salary payment (owner, or manager with permission)
router.post('/payment', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    if (req.user.role === 'manager' && !req.user.permissions.recordSalaryPayments) {
      return res.status(403).json({ message: 'No permission to record salary payments' });
    }
    const { userId, amount, note } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid userId and amount are required' });
    }
    const staff = await User.findOne({ _id: userId, shop: req.user.shop });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const payment = new SalaryPayment({
      user: userId,
      shop: req.user.shop,
      amount,
      note: note || 'Salary payment',
      recordedBy: req.user._id
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get salary history for a user
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role === 'employee' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const payments = await SalaryPayment.find({ user: userId, shop: req.user.shop })
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get salary summary for a user (earned, paid, balance)
router.get('/summary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    if (req.user.role === 'employee' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const staff = await User.findOne({ _id: userId, shop: req.user.shop });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    
    // Monthly calculation setup
    const dailySalary = staff.monthlySalary / 30;

    // Fetch all attendance for this user to calculate total earned
    const allAttendance = await Attendance.find({ user: userId, shop: req.user.shop });
    
    // Group attendance by YYYY-MM
    const monthlyAttendance = {};
    allAttendance.forEach(record => {
      const d = new Date(record.date);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyAttendance[mKey]) {
        monthlyAttendance[mKey] = { present: 0, absent: 0 };
      }
      if (record.status === 'present') monthlyAttendance[mKey].present++;
      else if (record.status === 'absent') monthlyAttendance[mKey].absent++;
    });

    let totalEarned = 0;
    
    // Calculate total earned over all time based on monthly grouping
    Object.keys(monthlyAttendance).forEach(mKey => {
      const absences = monthlyAttendance[mKey].absent;
      const deductedDays = Math.max(0, absences - 5);
      const earnedForMonth = staff.monthlySalary - (deductedDays * dailySalary);
      totalEarned += Math.max(0, earnedForMonth); // Ensure no negative earnings for a month
    });

    // Current month details
    const currentMKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    const currentMonthStats = monthlyAttendance[currentMKey] || { present: 0, absent: 0 };
    
    const presentDays = currentMonthStats.present;
    const absentDays = currentMonthStats.absent;
    const deductedDays = Math.max(0, absentDays - 5);
    const earnedSalary = Math.max(0, staff.monthlySalary - (deductedDays * dailySalary));

    // Total paid
    const payments = await SalaryPayment.find({ user: userId, shop: req.user.shop });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    const balance = totalEarned - totalPaid;

    res.json({
      monthlySalary: staff.monthlySalary,
      dailySalary: Math.round(dailySalary),
      currentMonth: {
        month: targetMonth,
        year: targetYear,
        presentDays,
        absentDays,
        totalDays: daysInMonth,
        earnedSalary: Math.round(earnedSalary)
      },
      totalEarned: Math.round(totalEarned),
      totalPaid,
      balance: Math.round(balance)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
