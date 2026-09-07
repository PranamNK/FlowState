import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      default: 'Development',
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'cancelled'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    accumulatedSeconds: {
      type: Number,
      default: 0,
    },
    focusScore: {
      type: Number,
      min: 1,
      max: 100,
      default: 80,
    },
    energyScore: {
      type: Number,
      min: 1,
      max: 100,
      default: 80,
    },
    outcome: {
      type: String,
      enum: ['completed', 'partially_completed', 'interrupted', 'abandoned'],
      default: 'completed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
