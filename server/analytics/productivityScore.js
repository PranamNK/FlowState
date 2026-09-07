/**
 * Pure calculation module for FlowScore / Productivity Score.
 * Explainable weighted model:
 * - Focus Quality: 30%
 * - Goal Alignment: 25%
 * - Outcome Completion: 25%
 * - Consistency: 10%
 * - Energy Quality: 10%
 */

const OUTCOME_SCORES = {
  completed: 100,
  partially_completed: 65,
  interrupted: 40,
  abandoned: 15,
};

export function calculateProductivityScore({
  activities = [],
  goals = [],
  targetDailyFocusMinutes = 240, // 4 hours baseline standard
}) {
  if (!activities || activities.length === 0) {
    return {
      totalScore: 0,
      breakdown: {
        focus: 0,
        goalAlignment: 0,
        outcome: 0,
        consistency: 0,
        energy: 0,
      },
    };
  }

  // 1. Focus Quality (30%)
  // Weighted by activity duration
  let totalDuration = 0;
  let weightedFocusSum = 0;
  let weightedEnergySum = 0;
  let outcomeSum = 0;

  for (const act of activities) {
    const dur = Math.max(1, act.durationMinutes || 0);
    totalDuration += dur;
    weightedFocusSum += (act.focusScore || 70) * dur;
    weightedEnergySum += (act.energyScore || 70) * dur;
    
    const outcomeScore = OUTCOME_SCORES[act.outcome] ?? 60;
    outcomeSum += outcomeScore * dur;
  }

  const avgFocus = totalDuration > 0 ? weightedFocusSum / totalDuration : 0;
  const avgEnergy = totalDuration > 0 ? weightedEnergySum / totalDuration : 0;
  const avgOutcome = totalDuration > 0 ? outcomeSum / totalDuration : 0;

  // 2. Goal Alignment (25%)
  // Ratio of time spent on goal categories vs total active time
  let goalAlignmentScore = 75; // Default neutral if no specific goals set
  if (goals && goals.length > 0) {
    const goalCategories = new Set(
      goals
        .map((g) => g.category)
        .filter((cat) => Boolean(cat))
    );

    if (goalCategories.size > 0) {
      const goalTime = activities
        .filter((act) => goalCategories.has(act.category))
        .reduce((sum, act) => sum + (act.durationMinutes || 0), 0);
      
      const ratio = totalDuration > 0 ? goalTime / totalDuration : 0;
      goalAlignmentScore = Math.min(100, Math.round(ratio * 120)); // scale generously
    } else {
      // General goal completion percentage
      goalAlignmentScore = Math.min(100, Math.round((totalDuration / targetDailyFocusMinutes) * 100));
    }
  }

  // 3. Consistency (10%)
  // Measures balanced distribution and pacing across the day
  let consistencyScore = 80;
  if (activities.length >= 3) {
    const focusVariances = activities.map((a) => Math.abs((a.focusScore || 70) - avgFocus));
    const avgVariance = focusVariances.reduce((s, v) => s + v, 0) / activities.length;
    consistencyScore = Math.max(40, Math.min(100, Math.round(100 - avgVariance * 1.5)));
  }

  const focusScoreNorm = Math.round(avgFocus);
  const energyScoreNorm = Math.round(avgEnergy);
  const outcomeScoreNorm = Math.round(avgOutcome);
  const goalScoreNorm = Math.round(goalAlignmentScore);
  const consistencyScoreNorm = Math.round(consistencyScore);

  const weightedTotal =
    focusScoreNorm * 0.3 +
    goalScoreNorm * 0.25 +
    outcomeScoreNorm * 0.25 +
    consistencyScoreNorm * 0.1 +
    energyScoreNorm * 0.1;

  const totalScore = Math.min(100, Math.max(0, Math.round(weightedTotal)));

  return {
    totalScore,
    breakdown: {
      focus: focusScoreNorm,
      goalAlignment: goalScoreNorm,
      outcome: outcomeScoreNorm,
      consistency: consistencyScoreNorm,
      energy: energyScoreNorm,
    },
  };
}
