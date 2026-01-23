import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import therapistRoutes from './routes/therapistRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import assignedTherapyRoutes from './routes/assignedTherapyRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Progress / therapy question routes (make sure these files export an express.Router)
import progressRoutes from './routes/progressRoutes.js'; // if you have this
import therapyQuestionRoutes from './routes/therapyQuestionRoutes.js'; // if you have this
import progressResponseRoutes from './routes/progressResponseRoutes.js'; // <-- router for progress responses

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (_, res) =>
  res.json({ ok: true, msg: '🩺 Panchkarma backend running successfully' })
);

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/assigned-therapies', assignedTherapyRoutes);

// progress / therapy question routers (ensure these modules exist and export a router)
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
  console.error('❌ Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Database and server startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
