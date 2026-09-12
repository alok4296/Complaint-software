const express = require('express');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch categories' });
  }
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const category = await Category.create({ name, description });
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to create category' });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update category' });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete category' });
  }
});

module.exports = router;
