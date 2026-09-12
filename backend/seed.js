const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/complaint-management-portal';
    await mongoose.connect(mongoURI);

    await User.deleteMany({});
    await Category.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
    });

    const staff1 = await User.create({
      name: 'Staff One',
      email: 'staff1@college.edu',
      password: 'Staff@123',
      role: 'staff',
    });

    const staff2 = await User.create({
      name: 'Staff Two',
      email: 'staff2@college.edu',
      password: 'Staff@123',
      role: 'staff',
    });

    const student1 = await User.create({
      name: 'Student One',
      email: 'student1@college.edu',
      password: 'Student@123',
      role: 'student',
      rollNumber: 'CS-2025-001',
    });

    const student2 = await User.create({
      name: 'Student Two',
      email: 'student2@college.edu',
      password: 'Student@123',
      role: 'student',
      rollNumber: 'CS-2025-002',
    });

    const categories = await Category.insertMany([
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

    const departments = await Department.insertMany([
      { name: 'Computer Science' },
      { name: 'Information Technology' },
      { name: 'Administration' },
      { name: 'Hostel Office' },
      { name: 'Library' },
      { name: 'Electrical' },
      { name: 'Transport' },
      { name: 'Security' },
    ]);

    const academicCategory = categories.find(c => c.name === 'Academic');
    const itDepartment = departments.find(d => d.name === 'Information Technology');
    const electricalDepartment = departments.find(d => d.name === 'Electrical');
    const hostelDepartment = departments.find(d => d.name === 'Hostel Office');

    await Complaint.insertMany([
      {
        complaintId: 'CMP-2026-0001',
        user: student1._id,
        title: 'Projector not working in classroom',
        description: 'The projector in room A-204 is not displaying content and the screen is flickering.',
        category: academicCategory._id,
        department: itDepartment._id,
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
        category: categories.find(c => c.name === 'Water/Sanitation')._id,
        department: hostelDepartment._id,
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
        category: categories.find(c => c.name === 'Electricity')._id,
        department: electricalDepartment._id,
        location: 'Lab 3',
        priority: 'Medium',
        status: 'Submitted',
        history: [{ action: 'Complaint Created', details: 'Complaint created by student', createdAt: new Date() }],
      },
    ]);

    console.log('Seed data created successfully');
    console.log('Admin login: admin@college.edu / Admin@123');
    console.log('Staff login: staff1@college.edu / Staff@123');
    console.log('Student login: student1@college.edu / Student@123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
