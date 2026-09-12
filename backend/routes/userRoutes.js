const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch profile' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.rollNumber = req.body.rollNumber || user.rollNumber;
    user.studentId = req.body.studentId || user.studentId;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Profile update failed' });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch users' });
  }
});

module.exports = router;
