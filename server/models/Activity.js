import mongoose from 'mongoose';

export const ACTIVITY_CATEGORIES = [
  'Development',
  'Study',
  'College',
  'Work',
  'Exercise',
  'Reading',
  'Planning',
  'Break',
  'Entertainment',
  'Social',
  'Other',
];

export const ACTIVITY_OUTCOMES = [
  'completed',
  'partially_completed',
  'interrupted',
  'abandoned',
];

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Other',
    },
    isPlanned: {
      type: Boolean,
      default: false,
    },
    plannedStartTime: {
      type: Date,
    },
    plannedEndTime: {
      type: Date,
    },
    plannedDurationMinutes: {
      type: Number,
      min: 0,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute'],
    },
    focusScore: {
      type: Number,
      min: 1,
      max: 100,
      default: 70,
    },
    energyScore: {
      type: Number,
      min: 1,
      max: 100,
      default: 70,
    },
    outcome: {
      type: String,
      enum: ACTIVITY_OUTCOMES,
      default: 'completed',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    source: {
      type: String,
      enum: ['manual', 'session', 'integration'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ userId: 1, startTime: 1 });
activitySchema.index({ userId: 1, category: 1, startTime: 1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
