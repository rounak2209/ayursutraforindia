import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // Agar .env me MONGO_URI (Atlas link) hai toh wo use hoga, warna local panchkarma db
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/panchkarma';
    
    await mongoose.connect(uri);
    

    console.log(`✅ MongoDB connected successfully to host`);
  } catch (err) {
    console.error(`❌ MongoDB connection error`);
    process.exit(1); 
  }
};

export default connectDB;