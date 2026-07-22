import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  aiScore: {
    overallScore: { type: Number, default: 0 },
    resumeScore: { type: Number, default: 0 },
    skillMatch: { type: Number, default: 0 },
    experienceMatch: { type: Number, default: 0 },
    educationMatch: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    ranking: { type: String, default: 'Not Rated' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }]
  }
}, { timestamps: true });

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);

