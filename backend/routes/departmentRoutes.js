const express = require('express');
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch departments' });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const department = await Department.create({ name, description });
    res.json({ message: 'Department created successfully', department });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to create department' });
  }
});

module.exports = router;
