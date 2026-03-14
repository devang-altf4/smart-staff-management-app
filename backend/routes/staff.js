const router = require('express').Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Add staff (owner only)
router.post('/', auth, authorize('owner'), async (req, res) => {
  try {
    const { name, phone, password, joiningDate, monthlySalary, role, permissions } = req.body;
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: 'Name, phone, password and role are required' });
    }
    if (!['employee', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Role must be employee or manager' });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone number already registered' });

    const staffData = {
      name,
      phone,
      password,
      role,
      shop: req.user.shop,
      joiningDate: joiningDate || Date.now(),
      monthlySalary: monthlySalary || 0
    };
    if (role === 'manager' && permissions) {
      staffData.permissions = permissions;
    }
    const staff = new User(staffData);
    await staff.save();
    const result = staff.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all staff for the shop
router.get('/', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    if (req.user.role === 'manager' && !req.user.permissions.viewStaffList) {
      return res.status(403).json({ message: 'No permission to view staff list' });
    }
    const staff = await User.find({ shop: req.user.shop, _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single staff member
router.get('/:id', auth, authorize('owner', 'manager'), async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, shop: req.user.shop }).select('-password');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update staff (owner only)
router.put('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const { name, monthlySalary, permissions, role } = req.body;
    const staff = await User.findOne({ _id: req.params.id, shop: req.user.shop });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    if (name) staff.name = name;
    if (monthlySalary !== undefined) staff.monthlySalary = monthlySalary;
    if (role && ['employee', 'manager'].includes(role)) staff.role = role;
    if (permissions && staff.role === 'manager') {
      staff.permissions = { ...staff.permissions.toObject?.() || staff.permissions, ...permissions };
    }
    await staff.save();
    const result = staff.toObject();
    delete result.password;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete staff (owner only)
router.delete('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const staff = await User.findOneAndDelete({ _id: req.params.id, shop: req.user.shop, role: { $ne: 'owner' } });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
