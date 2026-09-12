const express = require('express');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { complaintId, rating, comment } = req.body;

    if (!complaintId || !rating) {
      return res.status(400).json({ message: 'Complaint and rating are required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to give feedback on this complaint' });
    }

    const feedback = await Feedback.create({
      complaint: complaint._id,
      user: req.user._id,
      rating,
      comment: comment || '',
    });

    complaint.feedback = feedback._id;
    await complaint.save();

    await Notification.create({
      user: req.user._id,
      complaint: complaint._id,
      message: `Thank you for your feedback on complaint ${complaint.complaintId}.`,
      type: 'success',
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to submit feedback' });
  }
});

router.get('/complaint/:id', protect, async (req, res) => {
  try {
    const feedback = await Feedback.find({ complaint: req.params.id }).populate('user', 'name');
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch feedback' });
  }
});

module.exports = router;
