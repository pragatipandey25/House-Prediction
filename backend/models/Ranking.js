import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  resumeScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  skillMatch: { type: Number, default: 0 },
  experienceMatch: { type: Number, default: 0 },
  educationMatch: { type: Number, default: 0 },
  certificationScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  leadershipScore: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  recommendation: { type: String, default: '' },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  missingSkills: [{ type: String }],
  recommendations: [{ type: String }],
  status: {
    type: String,
    enum: ['analyzed', 'shortlisted', 'rejected'],
    default: 'analyzed'
  },
  aiMetadata: {
    model: { type: String, default: '' },
    analyzedAt: { type: Date, default: null },
    promptVersion: { type: String, default: '' }
  }
}, { timestamps: true });

// One ranking entry per candidate per job
rankingSchema.index({ job: 1, candidate: 1 }, { unique: true });
rankingSchema.index({ job: 1, rank: 1 });

export default mongoose.model('Ranking', rankingSchema);

