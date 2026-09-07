import { generateDeterministicInsights } from '../services/insightService.js';
import { generateAIInsights } from '../services/aiInsightService.js';

export async function getInsights(req, res, next) {
  try {
    const { period = 'daily', mode = 'deterministic' } = req.query;
    
    let insights = [];
    if (mode === 'ai') {
      insights = await generateAIInsights(req.user._id, period);
    } else {
      insights = await generateDeterministicInsights(req.user._id, period);
    }

    res.status(200).json({ success: true, count: insights.length, insights });
  } catch (err) {
    next(err);
  }
}
