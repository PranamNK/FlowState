import Groq from 'groq-sdk';
import { generateDeterministicInsights } from './insightService.js';
import { getDailyAnalytics, getWeeklyAnalytics } from './analyticsService.js';

export async function generateAIInsights(userId, period = 'daily') {
  const analytics =
    period === 'weekly'
      ? await getWeeklyAnalytics(userId)
      : await getDailyAnalytics(userId);

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return generateDeterministicInsights(userId, period);
  }

  try {
    const groq = new Groq({ apiKey });

    const structuredPayload = {
      period,
      summary: {
        flowScore: analytics.summary.flowScore,
        breakdown: analytics.summary.flowScoreBreakdown,
        totalTrackedHours: analytics.summary.totalTrackedHours,
        focusedHours: analytics.summary.focusedHours,
        deepWorkHours: Number(((analytics.summary.deepWorkMinutes || 0) / 60).toFixed(1)),
        deepWorkRatio: analytics.summary.deepWorkRatio,
        contextSwitches: analytics.summary.contextSwitches,
        switchRatePerHour: analytics.summary.switchRatePerHour,
      },
      baselineComparison: analytics.baselineComparison,
      bestFocusWindow: analytics.focusAnalysis.bestFocusWindow,
      plannedVsActual: {
        hasPlannedData: analytics.plannedVsActual.hasPlannedData,
        completionRate: analytics.plannedVsActual.completionRate,
        averageStartDelayMinutes: analytics.plannedVsActual.averageStartDelayMinutes,
        totalOverrunMinutes: analytics.plannedVsActual.totalOverrunMinutes,
      },
      topCategories: (analytics.categoryBreakdown || []).slice(0, 3).map((c) => ({
        category: c.category,
        hours: c.hours,
        avgFocus: c.avgFocusScore,
      })),
    };

    const systemPrompt = `
You are the Groq AI intelligence engine for FLOWSTATE, an editorial, data-grounded personal productivity platform.
You analyze the user's structured metrics and explain patterns in natural, objective, non-judgmental language.

RULES:
1. NEVER invent numbers or metrics. Use ONLY the figures provided in the JSON payload below.
2. Return a valid JSON object with an "insights" key containing an array of objects matching this exact schema:
{
  "insights": [
    {
      "title": "Short descriptive title (3-6 words)",
      "description": "Objective 1-2 sentence explanation of the metric or pattern.",
      "severity": "positive" | "neutral" | "attention",
      "type": "trend" | "baseline_comparison" | "peak_focus" | "context_switch" | "planned_vs_actual" | "recommendation",
      "experimentRecommendation": "One practical micro-experiment for tomorrow based strictly on this data."
    }
  ]
}
3. Provide 2 to 4 concise insight items.
`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `STRUCTURED METRICS PAYLOAD:\n${JSON.stringify(structuredPayload, null, 2)}` },
      ],
      temperature: 0.3,
    });

    const responseText = response.choices[0]?.message?.content || '{}';
    const parsedObj = JSON.parse(responseText);
    const parsedInsights = parsedObj.insights || (Array.isArray(parsedObj) ? parsedObj : []);

    if (Array.isArray(parsedInsights) && parsedInsights.length > 0) {
      return parsedInsights.map((item) => ({
        userId,
        period,
        type: item.type || 'trend',
        title: item.title,
        description: item.description + (item.experimentRecommendation ? ` Experiment: ${item.experimentRecommendation}` : ''),
        severity: item.severity || 'neutral',
        supportingMetrics: structuredPayload.summary,
        generatedBy: 'groq',
      }));
    }

    return generateDeterministicInsights(userId, period);
  } catch (error) {
    console.warn('[AI Insight Service] Groq call failed or returned invalid response, falling back to deterministic rules:', error.message);
    return generateDeterministicInsights(userId, period);
  }
}
