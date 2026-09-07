import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
      default: 'daily',
    },
    type: {
      type: String,
      enum: ['trend', 'baseline_comparison', 'peak_focus', 'context_switch', 'goal_progress', 'recommendation', 'planned_vs_actual'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['positive', 'neutral', 'attention'],
      default: 'neutral',
    },
    supportingMetrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    generatedBy: {
      type: String,
      enum: ['rules', 'gemini'],
      default: 'rules',
    },
  },
  {
    timestamps: true,
  }
);

insightSchema.index({ userId: 1, period: 1, createdAt: -1 });

const Insight = mongoose.model('Insight', insightSchema);

export default Insight;
