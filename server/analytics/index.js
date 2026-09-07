/**
 * Main Analytics Aggregation Engine
 * Combines FlowScore, context switching, focus analysis, planned vs actual,
 * baselines, and goal analysis into coherent structured payloads.
 */

import { calculateProductivityScore } from './productivityScore.js';
import { calculateContextSwitches, calculateCategoryBreakdown } from './contextSwitching.js';
import { calculateFocusAnalysis } from './focusAnalysis.js';
import { calculatePlannedVsActual } from './plannedVsActual.js';
import { calculateBaseline, compareWithBaseline } from './baseline.js';
import { calculateGoalProgress } from './goalAnalysis.js';

export function aggregatePeriodAnalytics({
  period = 'daily',
  activities = [],
  historicalActivities = [],
  goals = [],
  dateRange = {},
}) {
  // 1. Productivity Score & Breakdown
  const flowScoreResult = calculateProductivityScore({
    activities,
    goals,
  });

  // 2. Context Switching & Categories
  const contextSwitchResult = calculateContextSwitches(activities);
  const categoryBreakdown = calculateCategoryBreakdown(activities);

  // 3. Focus & Deep Work Analysis
  const focusResult = calculateFocusAnalysis(activities);

  // 4. Planned vs Actual Adherence
  const plannedVsActualResult = calculatePlannedVsActual(activities);

  // 5. Historical Baseline & Comparison
  const baselineResult = calculateBaseline(historicalActivities, 30);
  const baselineComparison = compareWithBaseline(
    {
      focusedMinutes: focusResult.deepWorkMinutes || Math.round(focusResult.totalTrackedMinutes * 0.7),
      productivityScore: flowScoreResult.totalScore,
      contextSwitches: contextSwitchResult.totalSwitches,
    },
    baselineResult
  );

  // 6. Goal Progress
  const goalProgressResult = calculateGoalProgress(goals, activities);

  // Summary Metrics
  const totalTrackedMinutes = activities.reduce((s, a) => s + (a.durationMinutes || 0), 0);
  const totalTrackedHours = Number((totalTrackedMinutes / 60).toFixed(1));
  const breakMinutes = activities
    .filter((a) => ['break', 'rest'].includes((a.category || '').toLowerCase()))
    .reduce((s, a) => s + (a.durationMinutes || 0), 0);
  const focusedMinutes = Math.max(0, totalTrackedMinutes - breakMinutes);

  return {
    period,
    dateRange,
    summary: {
      flowScore: flowScoreResult.totalScore,
      flowScoreBreakdown: flowScoreResult.breakdown,
      totalTrackedMinutes,
      totalTrackedHours,
      focusedMinutes,
      focusedHours: Number((focusedMinutes / 60).toFixed(1)),
      breakMinutes,
      breakHours: Number((breakMinutes / 60).toFixed(1)),
      deepWorkMinutes: focusResult.deepWorkMinutes,
      deepWorkRatio: focusResult.deepWorkRatio,
      averageFocusScore: focusResult.averageFocusScore,
      totalActivities: activities.length,
      contextSwitches: contextSwitchResult.totalSwitches,
      switchRatePerHour: contextSwitchResult.switchRatePerHour,
    },
    focusAnalysis: focusResult,
    contextSwitching: contextSwitchResult,
    categoryBreakdown,
    plannedVsActual: plannedVsActualResult,
    baseline: baselineResult,
    baselineComparison,
    goals: goalProgressResult,
  };
}

export {
  calculateProductivityScore,
  calculateContextSwitches,
  calculateCategoryBreakdown,
  calculateFocusAnalysis,
  calculatePlannedVsActual,
  calculateBaseline,
  compareWithBaseline,
  calculateGoalProgress,
};
