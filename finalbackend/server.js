import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';


import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import therapistRoutes from './routes/therapistRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import assignedTherapyRoutes from './routes/assignedTherapyRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';




import progressRoutes from './routes/progressRoutes.js'; 
import therapyQuestionRoutes from './routes/therapyQuestionRoutes.js'; 
import progressResponseRoutes from './routes/progressResponseRoutes.js'; 
import bookingRoutes from './routes/bookingRoutes.js'; 
import trackingRoutes from './routes/trackingRoutes.js'; 

dotenv.config();

const app = express();





// Define allowed frontend URLs (Localhost + Production URLs)
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173', 
  'http://localhost:3000', 
  process.env.FRONTEND_URL 
].filter(Boolean); // Removes undefined/null values

const corsOptions = {
  origin: function (origin, callback) {
    // Agar origin allowed list me hai, ya koi origin nahi hai (like Postman/Mobile app)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: Not allowed by CORS'));
    }
  },
  credentials: true, // Zaroori hai agar tokens ya cookies send kar rahe ho
  optionsSuccessStatus: 200
};

// Use middleware
app.use(cors(corsOptions));
app.use(express.json());


const logStream = fs.createWriteStream(path.join(process.cwd(), 'api-usage.log'), { flags: 'a' });

// 👉 NEW CODE 3: Morgan ko middleware ki tarah use karein
// Terminal mein bhi dikhega aur file mein bhi save hoga
// app.use(morgan('dev')); 
// app.use(morgan('common', { stream: logStream })); 


app.get('/', (_, res) =>
  res.json({ ok: true, msg: '🩺 Panchkarma backend running successfully' })
);


app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/assigned-therapies', assignedTherapyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tracking", trackingRoutes);

// Optional routes
if (progressRoutes) app.use('/api/progress', progressRoutes);
if (therapyQuestionRoutes) app.use('/api/therapy-questions', therapyQuestionRoutes);
if (progressResponseRoutes) app.use('/api/progress-responses', progressResponseRoutes);
if (assignedTherapyRoutes) app.use('/api/assigned-therapists', assignedTherapyRoutes);

// Handle unknown routes gracefully
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  
  console.error('❌ Server Error:', err.message);
  
  
  res.status(500).json({ message: 'Internal Server Error. Please try again later.' });
});




const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();