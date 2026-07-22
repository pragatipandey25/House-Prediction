import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    required: [true, 'Experience requirement is required']
  },
  education: {
    type: String,
    required: [true, 'Education requirement is required']
  },
  salary: {
    type: String,
    default: 'Not specified'
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  company: {
    type: String,
    required: [true, 'Company name is required']
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);

