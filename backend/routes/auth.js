const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');

// Register owner
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, shopName, shopAddress } = req.body;
    if (!name || !phone || !password || !shopName) {
      return res.status(400).json({ message: 'Name, phone, password and shop name are required' });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone number already registered' });

    const owner = new User({ name, phone, password, role: 'owner' });
    await owner.save();

    const shop = new Shop({ name: shopName, address: shopAddress || '', owner: owner._id });
    await shop.save();

    owner.shop = shop._id;
    await owner.save();

    const token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { _id: owner._id, name: owner.name, phone: owner.phone, role: owner.role, shop: shop._id }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        shop: user.shop,
        permissions: user.permissions,
        monthlySalary: user.monthlySalary
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
