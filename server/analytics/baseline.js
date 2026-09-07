/**
 * Pure calculation module for Personal Productivity Baselines.
 * Evaluates the user's historical rolling window (7-day / 30-day) and provides
 * personalized relative comparisons rather than arbitrary external benchmarks.
 */

import { calculateProductivityScore } from './productivityScore.js';
import { calculateContextSwitches } from './contextSwitching.js';

export function calculateBaseline(historicalActivities = [], periodDays = 30) {
  if (!historicalActivities || historicalActivities.length === 0) {
    return {
      hasBaseline: false,
      periodDays,
      daysTracked: 0,
      avgDailyFocusMinutes: 0,
      avgDailyTrackedMinutes: 0,
      avgDailyFlowScore: 0,
      avgSessionMinutes: 0,
      avgDailyContextSwitches: 0,
    };
  }

  // Group activities by date string (YYYY-MM-DD)
  const daysMap = {};
  for (const act of historicalActivities) {
    const dateStr = new Date(act.startTime).toISOString().split('T')[0];
    if (!daysMap[dateStr]) {
      daysMap[dateStr] = [];
    }
    daysMap[dateStr].push(act);
  }

  const daysCount = Object.keys(daysMap).length;
  if (daysCount === 0) {
    return {
      hasBaseline: false,
      periodDays,
      daysTracked: 0,
      avgDailyFocusMinutes: 0,
      avgDailyTrackedMinutes: 0,
      avgDailyFlowScore: 0,
      avgSessionMinutes: 0,
      avgDailyContextSwitches: 0,
    };
  }

  let totalTrackedMinutes = 0;
  let totalFocusWeightedMinutes = 0;
  let totalScoreSum = 0;
  let totalSwitchesSum = 0;
  let totalSessions = 0;

  for (const [dateStr, dayActs] of Object.entries(daysMap)) {
    let dayMinutes = 0;
    let dayFocusSum = 0;
    totalSessions += dayActs.length;

    for (const act of dayActs) {
      const dur = act.durationMinutes || 0;
      dayMinutes += dur;
      dayFocusSum += (act.focusScore || 70) * dur;
    }

    totalTrackedMinutes += dayMinutes;
    totalFocusWeightedMinutes += dayFocusSum;

    const dayScore = calculateProductivityScore({ activities: dayActs });
    totalScoreSum += dayScore.totalScore;

    const daySwitches = calculateContextSwitches(dayActs);
    totalSwitchesSum += daySwitches.totalSwitches;
  }

  const avgDailyTracked = Math.round(totalTrackedMinutes / daysCount);
  const avgDailyFocus = totalTrackedMinutes > 0
    ? Math.round((totalFocusWeightedMinutes / totalTrackedMinutes / 100) * avgDailyTracked)
    : 0;
  const avgDailyScore = Math.round(totalScoreSum / daysCount);
  const avgDailySwitches = Number((totalSwitchesSum / daysCount).toFixed(1));
  const avgSessionDuration = totalSessions > 0 ? Math.round(totalTrackedMinutes / totalSessions) : 0;

  return {
    hasBaseline: daysCount >= 3,
    periodDays,
    daysTracked: daysCount,
    avgDailyFocusMinutes: avgDailyFocus,
    avgDailyTrackedMinutes: avgDailyTracked,
    avgDailyFlowScore: avgDailyScore,
    avgSessionMinutes: avgSessionDuration,
    avgDailyContextSwitches: avgDailySwitches,
  };
}

/**
 * Compare current metrics against personal historical baseline
 */
export function compareWithBaseline(currentMetrics, baseline) {
  if (!baseline || !baseline.hasBaseline) {
    return {
      hasComparison: false,
      message: 'Track 3+ days to establish your personal productivity baseline.',
      comparisons: {},
    };
  }

  const calcDiff = (current, base, isLowerBetter = false) => {
    if (base === 0) return { diffPct: 0, direction: 'neutral', text: 'On baseline' };
    const diff = current - base;
    const diffPct = Math.round((diff / base) * 100);
    const isPositive = isLowerBetter ? diff < 0 : diff > 0;
    const direction = diff === 0 ? 'neutral' : isPositive ? 'better' : 'worse';
    const text =
      diffPct === 0
        ? 'Matches your baseline'
        : `${Math.abs(diffPct)}% ${diff > 0 ? 'above' : 'below'} your baseline`;

    return { diffPct, direction, text, rawDiff: diff };
  };

  const currentFocus = currentMetrics.focusedMinutes || currentMetrics.totalFocusMinutes || 0;
  const currentScore = currentMetrics.productivityScore || currentMetrics.flowScore || 0;
  const currentSwitches = currentMetrics.contextSwitches || 0;

  const focusComp = calcDiff(currentFocus, baseline.avgDailyFocusMinutes);
  const scoreComp = calcDiff(currentScore, baseline.avgDailyFlowScore);
  const switchesComp = calcDiff(currentSwitches, baseline.avgDailyContextSwitches, true);

  return {
    hasComparison: true,
    focus: focusComp,
    score: scoreComp,
    contextSwitches: switchesComp,
    summarySentence:
      scoreComp.diffPct >= 0
        ? `Your FlowScore is ${scoreComp.text}.`
        : `Your FlowScore is ${scoreComp.text}.`,
  };
}
