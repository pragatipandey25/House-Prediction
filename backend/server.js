import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';

dotenv.config();

connectDB();

// Seed default admin account once DB connection is established
mongoose.connection.once('open', async () => {
  try {
    // Remove old admin with generic email if exists
    await User.deleteOne({ email: 'admin@gmail.com' });
    
    const adminExists = await User.findOne({ email: 'pragatipandey454@gmail.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await User.create({
        name: 'Pragati Pandey',
        email: 'pragatipandey454@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Default admin account created (pragatipandey454@gmail.com / Admin@123)');
    } else {
      console.log('ℹ️ Admin account already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding admin account:', error.message);
  }
});

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ Enable CORS BEFORE routes
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analysis', analysisRoutes);

app.get('/', (req, res) => {
    res.send('AI Resume Screening & Candidate Ranking API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
