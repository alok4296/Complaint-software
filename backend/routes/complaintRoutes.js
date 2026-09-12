const express = require('express');
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Department = require('../models/Department');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const getNextComplaintId = async () => {
  const year = new Date().getFullYear();
  const currentYearComplaints = await Complaint.countDocuments({
    complaintId: { $regex: `^CMP-${year}-` },
  });

  const sequence = String(currentYearComplaints + 1).padStart(4, '0');
  return `CMP-${year}-${sequence}`;
};

const addHistory = (complaint, action, details) => {
  complaint.history.push({ action, details, createdAt: new Date() });
};

const createNotification = async (userId, complaintId, message, type = 'info') => {
  if (!userId) return;
  await Notification.create({ user: userId, complaint: complaintId || null, message, type });
};

router.get('/my', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch complaints' });
  }
});

router.get('/staff/assigned', protect, authorize('staff'), async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedStaff: req.user._id })
      .populate('user', 'name email')
      .populate('category', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch assigned complaints' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email rollNumber studentId')
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email role')
      .populate('feedback');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOwner = req.user._id.toString() === complaint.user._id.toString();
    const isAssignedStaff = req.user.role === 'staff' && complaint.assignedStaff && complaint.assignedStaff._id.toString() === req.user._id.toString();

    if (req.user.role !== 'admin' && !isOwner && !isAssignedStaff) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch complaint details' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, department, location, priority } = req.body;

    if (!title || !description || !category || !department || !location || !priority) {
      return res.status(400).json({ message: 'Please provide all required complaint fields' });
    }

    const attachmentPath = req.file ? `/uploads/${req.file.filename}` : (req.body.attachment || '');

    const categoryDoc = await Category.findById(category);
    const departmentDoc = await Department.findById(department);

    if (!categoryDoc || !departmentDoc) {
      return res.status(400).json({ message: 'Selected category or department is invalid' });
    }

    const complaintId = await getNextComplaintId();
    const complaint = await Complaint.create({
      complaintId,
      user: req.user._id,
      title,
      description,
      category: categoryDoc._id,
      department: departmentDoc._id,
      location,
      priority,
      status: 'Submitted',
      attachment: attachmentPath,
    });

    addHistory(complaint, 'Complaint Submitted', `Complaint created with ID ${complaintId}`);
    complaint.save();

    await ComplaintUpdate.create({
      complaint: complaint._id,
      user: req.user._id,
      action: 'Complaint Submitted',
      details: `Complaint ${complaintId} submitted successfully`,
      status: 'Submitted',
    });

    await createNotification(req.user._id, complaint._id, `Your complaint ${complaintId} has been submitted.`, 'success');

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Complaint submission failed' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this complaint' });
    }

    const fields = ['title', 'description', 'category', 'department', 'location', 'priority'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) complaint[field] = req.body[field];
    });

    complaint.updatedAt = new Date();
    await complaint.save();

    res.json({ message: 'Complaint updated', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Complaint update failed' });
  }
});

router.post('/:id/reopen', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to reopen this complaint' });
    }

    complaint.status = 'Reopen Request';
    complaint.reopenRequested = true;
    complaint.updatedAt = new Date();
    addHistory(complaint, 'Reopen Requested', 'Student requested complaint to be reopened.');
    await complaint.save();

    await createNotification(req.user._id, complaint._id, `Your complaint ${complaint.complaintId} has been marked for reopening review.`, 'warning');

    res.json({ message: 'Reopen request submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Could not request reopen' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('user', 'name email')
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('assignedStaff', 'name')
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch complaints' });
  }
});

module.exports = router;
