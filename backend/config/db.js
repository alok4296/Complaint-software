const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/complaint-management-portal';

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB connection failed, falling back to in-memory MongoDB for demo mode.');
    memoryServer = await MongoMemoryServer.create();
    const memoryURI = memoryServer.getUri();
    await mongoose.connect(memoryURI);
    console.log('In-memory MongoDB connected successfully');
  }
}

module.exports = { connectDB };
