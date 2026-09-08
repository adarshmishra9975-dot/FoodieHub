const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodiehub';

  try {
    // Attempt standard connection first (e.g., local MongoDB Compass / standalone mongod)
    console.log(`[Database] Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('✅ MongoDB connected successfully to ' + uri);
  } catch (error) {
    console.warn('⚠️ Could not connect to local standalone mongod (' + error.message + ').');
    console.log('🔄 Initializing embedded MongoDB server for container/preview environment...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'foodiehub',
        },
      });
      const memoryUri = memoryServer.getUri();
      console.log(`[Database] Embedded MongoDB running at: ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log('✅ Connected to MongoDB via Embedded Server on port 27017');
    } catch (innerErr) {
      console.error('❌ Failed to initialize MongoDB connection:', innerErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
