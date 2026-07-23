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
  resumeScore: { type: Number, default: null },
  atsScore: { type: Number, default: null },
  skillMatch: { type: Number, default: null },
  experienceMatch: { type: Number, default: null },
  educationMatch: { type: Number, default: null },
  certificationScore: { type: Number, default: null },
  communicationScore: { type: Number, default: null },
  leadershipScore: { type: Number, default: null },
  projectQuality: { type: Number, default: null },
  problemSolving: { type: Number, default: null },
  softSkillsMatch: { type: Number, default: null },
  confidenceScore: { type: Number, default: null },
  overallScore: { type: Number, default: null },
  rank: { type: Number, default: 0 },
  recommendation: { type: String, default: '' },
  rankingReason: { type: String, default: '' },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  missingSkills: [{ type: String }],
  recommendations: [{ type: String }],
  improvementSuggestions: [{ type: String }],
  atsSuggestions: [{ type: String }],
  status: {
    type: String,
    enum: ['analyzed', 'shortlisted', 'rejected', 'ai_unavailable'],
    default: 'analyzed'
  },
  aiMetadata: {
    model: { type: String, default: '' },
    analyzedAt: { type: Date, default: null },
    promptVersion: { type: String, default: '' }
  }
}, { timestamps: true });

// Compound indexes for performance
rankingSchema.index({ job: 1, candidate: 1 }, { unique: true });
rankingSchema.index({ job: 1, rank: 1 });
rankingSchema.index({ job: 1, overallScore: -1 });
rankingSchema.index({ candidate: 1, createdAt: -1 });

export default mongoose.model('Ranking', rankingSchema);
