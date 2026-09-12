const User = require('./models/User');
const Category = require('./models/Category');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');

async function initializeDemoData() {
  try {
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const departmentCount = await Department.countDocuments();

    if (userCount === 0) {
      await User.create([
        { name: 'Admin User', email: 'admin@college.edu', password: 'Admin@123', role: 'admin' },
        { name: 'Staff One', email: 'staff1@college.edu', password: 'Staff@123', role: 'staff' },
        { name: 'Staff Two', email: 'staff2@college.edu', password: 'Staff@123', role: 'staff' },
        { name: 'Student One', email: 'student1@college.edu', password: 'Student@123', role: 'student', rollNumber: 'CS-2025-001' },
        { name: 'Student Two', email: 'student2@college.edu', password: 'Student@123', role: 'student', rollNumber: 'CS-2025-002' },
      ]);
    }

    if (categoryCount === 0) {
      await Category.insertMany([
        { name: 'Academic' },
        { name: 'Examination' },
        { name: 'Infrastructure' },
        { name: 'Electricity' },
        { name: 'Water/Sanitation' },
        { name: 'Hostel' },
        { name: 'Library' },
        { name: 'Computer/IT' },
        { name: 'Transport' },
        { name: 'Security' },
        { name: 'Administration' },
        { name: 'Other' },
      ]);
    }

    if (departmentCount === 0) {
      await Department.insertMany([
        { name: 'Computer Science' },
        { name: 'Information Technology' },
        { name: 'Administration' },
        { name: 'Hostel Office' },
        { name: 'Library' },
        { name: 'Electrical' },
        { name: 'Transport' },
        { name: 'Security' },
      ]);
    }

    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      const [admin, staff1, staff2, student1, student2] = await User.find().sort({ createdAt: 1 });
      const categories = await Category.find();
      const departments = await Department.find();

      const academic = categories.find((c) => c.name === 'Academic');
      const water = categories.find((c) => c.name === 'Water/Sanitation');
      const electricity = categories.find((c) => c.name === 'Electricity');
      const itDept = departments.find((d) => d.name === 'Information Technology');
      const hostelDept = departments.find((d) => d.name === 'Hostel Office');
      const electricalDept = departments.find((d) => d.name === 'Electrical');

      await Complaint.insertMany([
        {
          complaintId: 'CMP-2026-0001',
          user: student1._id,
          title: 'Projector not working in classroom',
          description: 'The projector in room A-204 is not displaying content and the screen is flickering.',
          category: academic._id,
          department: itDept._id,
          location: 'A-204',
          priority: 'High',
          status: 'Assigned',
          assignedStaff: staff1._id,
          history: [{ action: 'Complaint Created', details: 'Complaint created by student', createdAt: new Date() }],
        },
        {
          complaintId: 'CMP-2026-0002',
          user: student2._id,
          title: 'Water leakage in hostel bathroom',
          description: 'The bathroom pipe is leaking and floors are wet causing hygiene concern.',
          category: water._id,
          department: hostelDept._id,
          location: 'Hostel Block B',
          priority: 'Critical',
          status: 'In Progress',
          assignedStaff: staff2._id,
          history: [{ action: 'Complaint Created', details: 'Complaint created by student', createdAt: new Date() }],
        },
        {
          complaintId: 'CMP-2026-0003',
          user: student1._id,
          title: 'Power outage in lab area',
          description: 'The lab sockets are not supplying power after the 10 AM outage.',
          category: electricity._id,
          department: electricalDept._id,
          location: 'Lab 3',
          priority: 'Medium',
          status: 'Submitted',
          history: [{ action: 'Complaint Created', details: 'Complaint created by student', createdAt: new Date() }],
        },
      ]);
    }

    console.log('Demo seed data checked and initialized');
  } catch (error) {
    console.error('Demo data initialization failed:', error.message);
  }
}

module.exports = { initializeDemoData };
