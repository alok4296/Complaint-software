const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Category = require('../models/Category');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('user', 'name email')
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch complaints' });
  }
});

router.put('/complaints/:id/assign', async (req, res) => {
  try {
    const { staffId, departmentId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (staffId) {
      complaint.assignedStaff = staffId;
    }
    if (departmentId) {
      complaint.department = departmentId;
    }

    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    complaint.updatedAt = new Date();
    complaint.history.push({
      action: 'Assigned',
      details: staffId ? `Complaint assigned to staff member` : `Complaint assigned to department`,
      createdAt: new Date(),
    });
    await complaint.save();

    const staffUser = await User.findById(staffId);
    if (staffUser) {
      await Notification.create({
        user: staffUser._id,
        complaint: complaint._id,
        message: `Complaint ${complaint.complaintId} has been assigned to you.`,
        type: 'info',
      });
    }

    await ComplaintUpdate.create({
      complaint: complaint._id,
      user: req.user._id,
      action: 'Complaint Assigned',
      details: `Complaint assigned to ${staffUser ? staffUser.name : 'staff member'}`,
      status: complaint.status,
    });

    res.json({ message: 'Complaint assigned successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to assign complaint' });
  }
});

router.put('/complaints/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    complaint.updatedAt = new Date();
    complaint.history.push({
      action: 'Status Updated',
      details: `Status changed to ${status}`,
      createdAt: new Date(),
    });

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    await ComplaintUpdate.create({
      complaint: complaint._id,
      user: req.user._id,
      action: 'Status Update',
      details: `Complaint status changed to ${status}`,
      status,
    });

    await Notification.create({
      user: complaint.user,
      complaint: complaint._id,
      message: `Complaint ${complaint.complaintId} is now ${status}.`,
      type: status === 'Resolved' ? 'success' : 'info',
    });

    res.json({ message: 'Complaint status updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update complaint status' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: { $in: ['Submitted', 'Under Review', 'Assigned'] } });
    const underReview = await Complaint.countDocuments({ status: 'Under Review' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const closed = await Complaint.countDocuments({ status: 'Closed' });
    const critical = await Complaint.countDocuments({ priority: 'Critical' });

    const categoryStats = await Complaint.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
      { $group: { _id: '$categoryInfo.name', count: { $sum: 1 } } },
    ]);

    const departmentStats = await Complaint.aggregate([
      { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'departmentInfo' } },
      { $group: { _id: '$departmentInfo.name', count: { $sum: 1 } } },
    ]);

    res.json({
      totalComplaints,
      pendingComplaints,
      underReview,
      inProgress,
      resolved,
      closed,
      critical,
      categoryStats,
      departmentStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch admin statistics' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch users' });
  }
});

module.exports = router;
