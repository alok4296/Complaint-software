const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    location: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
        'Reopen Request'
      ],
      default: 'Submitted',
    },
    attachment: { type: String, default: '' },
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    resolutionRemarks: { type: String, default: '' },
    resolutionEvidence: { type: String, default: '' },
    reopenRequested: { type: Boolean, default: false },
    history: [
      {
        action: String,
        details: String,
        createdAt: { type: Date, default: Date.now },
      }
    ],
    feedback: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
