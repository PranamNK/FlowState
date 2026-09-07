import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      default: null,
    },
    targetType: {
      type: String,
      enum: ['hours', 'sessions', 'focus_score'],
      default: 'hours',
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: 0.1,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'achieved', 'missed', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ userId: 1, status: 1, period: 1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
