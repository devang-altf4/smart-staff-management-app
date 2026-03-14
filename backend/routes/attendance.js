const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Mark attendance (owner or manager with permission)
router.post('/', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    if (req.user.role === 'manager' && !req.user.permissions.markAttendance) {
      return res.status(403).json({ message: 'No permission to mark attendance' });
    }
    const { userId, date, status } = req.body;
    if (!userId || !date || !status) {
      return res.status(400).json({ message: 'userId, date and status are required' });
    }
    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ message: 'Status must be present or absent' });
    }
    // Verify user belongs to same shop
    const staff = await User.findOne({ _id: userId, shop: req.user.shop });
    if (!staff) return res.status(404).json({ message: 'Staff not found in your shop' });

    const existing = await Attendance.findOne({ user: userId, date });
    if (existing) {
      existing.status = status;
      existing.markedBy = req.user._id;
      await existing.save();
      return res.json(existing);
    }
    const attendance = new Attendance({
      user: userId,
      shop: req.user.shop,
      date,
      status,
      markedBy: req.user._id
    });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk mark attendance for a day
router.post('/bulk', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    if (req.user.role === 'manager' && !req.user.permissions.markAttendance) {
      return res.status(403).json({ message: 'No permission to mark attendance' });
    }
    const { date, records } = req.body; // records: [{ userId, status }]
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'date and records array are required' });
    }
    const results = [];
    for (const record of records) {
      const staff = await User.findOne({ _id: record.userId, shop: req.user.shop });
      if (!staff) continue;

      const existing = await Attendance.findOne({ user: record.userId, date });
      if (existing) {
        existing.status = record.status;
        existing.markedBy = req.user._id;
        await existing.save();
        results.push(existing);
      } else {
        const attendance = new Attendance({
          user: record.userId,
          shop: req.user.shop,
          date,
          status: record.status,
          markedBy: req.user._id
        });
        await attendance.save();
        results.push(attendance);
      }
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance for a staff member (owner/manager or the employee themselves)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    // Employees can view only their own attendance
    if (req.user.role === 'employee' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let query = { user: userId, shop: req.user.shop };
    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endMonth = parseInt(month);
      const endYear = parseInt(year);
      const lastDay = new Date(endYear, endMonth, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance for a specific date (all staff)
router.get('/date/:date', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ shop: req.user.shop, date: req.params.date })
      .populate('user', 'name phone role');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
