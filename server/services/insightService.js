import Insight from '../models/Insight.js';
import { getDailyAnalytics, getWeeklyAnalytics } from './analyticsService.js';

export async function generateDeterministicInsights(userId, period = 'daily') {
  const analytics =
    period === 'weekly'
      ? await getWeeklyAnalytics(userId)
      : await getDailyAnalytics(userId);

  const insights = [];
  const { summary, focusAnalysis, contextSwitching, baselineComparison, plannedVsActual, categoryBreakdown } = analytics;

  if (summary.totalActivities === 0) {
    return [
      {
        userId,
        period,
        type: 'recommendation',
        title: 'Start Tracking Today',
        description: 'Log your first activity or start a live timer to begin building your personal productivity baseline.',
        severity: 'neutral',
        supportingMetrics: { totalActivities: 0 },
        generatedBy: 'rules',
      },
    ];
  }

  if (baselineComparison && baselineComparison.hasComparison) {
    const { focus, score, contextSwitches } = baselineComparison;
    if (Math.abs(focus.diffPct) >= 10) {
      insights.push({
        userId,
        period,
        type: 'baseline_comparison',
        title: `Focus Time ${focus.diffPct > 0 ? 'Surge' : 'Dip'}`,
        description: `Your focus time is ${focus.text} (${summary.focusedHours} hrs vs baseline average).`,
        severity: focus.diffPct > 0 ? 'positive' : 'attention',
        supportingMetrics: { currentFocus: summary.focusedHours, baselineDiffPct: focus.diffPct },
        generatedBy: 'rules',
      });
    }

    if (Math.abs(contextSwitches.diffPct) >= 20) {
      insights.push({
        userId,
        period,
        type: 'context_switch',
        title: contextSwitches.diffPct < 0 ? 'Streamlined Focus Flow' : 'High Context Fragmentation',
        description: `Context switching is ${contextSwitches.text} (${summary.contextSwitches} switches recorded).`,
        severity: contextSwitches.diffPct < 0 ? 'positive' : 'attention',
        supportingMetrics: { switches: summary.contextSwitches, diffPct: contextSwitches.diffPct },
        generatedBy: 'rules',
      });
    }
  }

  if (focusAnalysis.bestFocusWindow && focusAnalysis.bestFocusWindow !== 'N/A' && focusAnalysis.totalTrackedMinutes >= 60) {
    insights.push({
      userId,
      period,
      type: 'peak_focus',
      title: 'Peak Productivity Window',
      description: `Your highest focus quality consistently concentrates between ${focusAnalysis.bestFocusWindow}.`,
      severity: 'positive',
      supportingMetrics: { bestWindow: focusAnalysis.bestFocusWindow, deepWorkRatio: focusAnalysis.deepWorkRatio },
      generatedBy: 'rules',
    });
  }

  if (contextSwitching.switchRatePerHour > 1.5 && summary.totalTrackedMinutes >= 60) {
    insights.push({
      userId,
      period,
      type: 'context_switch',
      title: 'Elevated Category Switching',
      description: `You averaged ${contextSwitching.switchRatePerHour} category switches per hour. Grouping similar tasks can preserve cognitive momentum.`,
      severity: 'attention',
      supportingMetrics: { switchRate: contextSwitching.switchRatePerHour },
      generatedBy: 'rules',
    });
  }

  if (plannedVsActual && plannedVsActual.hasPlannedData) {
    if (plannedVsActual.completionRate >= 80) {
      insights.push({
        userId,
        period,
        type: 'planned_vs_actual',
        title: 'High Plan Alignment',
        description: `Completed ${plannedVsActual.completionRate}% of planned activities with ${plannedVsActual.averageStartDelayMinutes}m average start deviation.`,
        severity: 'positive',
        supportingMetrics: { completionRate: plannedVsActual.completionRate },
        generatedBy: 'rules',
      });
    } else if (plannedVsActual.totalOverrunMinutes > 40) {
      insights.push({
        userId,
        period,
        type: 'planned_vs_actual',
        title: 'Schedule Drift Detected',
        description: `Activities exceeded planned durations by ${plannedVsActual.totalOverrunMinutes} minutes in total. Consider adding buffer periods between blocks.`,
        severity: 'attention',
        supportingMetrics: { overrunMinutes: plannedVsActual.totalOverrunMinutes },
        generatedBy: 'rules',
      });
    }
  }

  if (categoryBreakdown && categoryBreakdown.length > 0) {
    const topCat = categoryBreakdown[0];
    if (topCat.percentage >= 40 && topCat.minutes >= 90) {
      insights.push({
        userId,
        period,
        type: 'trend',
        title: `Primary Focus: ${topCat.category}`,
        description: `${topCat.category} comprised ${topCat.percentage}% (${topCat.hours}h) of your tracked time with an average focus score of ${topCat.avgFocusScore}/100.`,
        severity: 'neutral',
        supportingMetrics: { category: topCat.category, hours: topCat.hours, focusScore: topCat.avgFocusScore },
        generatedBy: 'rules',
      });
    }
  }

  return insights;
}
