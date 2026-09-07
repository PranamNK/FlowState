/**
 * Pure calculation module for Goal Progress Analysis.
 */

export function calculateGoalProgress(goals = [], activities = []) {
  if (!goals || goals.length === 0) {
    return {
      totalGoals: 0,
      achievedCount: 0,
      activeGoals: [],
      overallCompletionRate: 0,
    };
  }

  let achievedCount = 0;
  let totalProgressPctSum = 0;

  const activeGoals = goals.map((goal) => {
    // Filter activities within the goal's date range and matching category
    const start = new Date(goal.startDate).getTime();
    const end = new Date(goal.endDate).getTime();

    const matchingActivities = activities.filter((act) => {
      const actTime = new Date(act.startTime).getTime();
      const inRange = actTime >= start && actTime <= end;
      if (!inRange) return false;
      if (!goal.category) return true;
      return act.category.toLowerCase() === goal.category.toLowerCase();
    });

    let currentValue = 0;
    if (goal.targetType === 'hours') {
      const totalMins = matchingActivities.reduce((s, a) => s + (a.durationMinutes || 0), 0);
      currentValue = Number((totalMins / 60).toFixed(1));
    } else if (goal.targetType === 'sessions') {
      currentValue = matchingActivities.length;
    } else if (goal.targetType === 'focus_score') {
      const totalMins = matchingActivities.reduce((s, a) => s + (a.durationMinutes || 0), 0);
      if (totalMins > 0) {
        const weightedFocus = matchingActivities.reduce((s, a) => s + (a.focusScore || 70) * (a.durationMinutes || 0), 0);
        currentValue = Math.round(weightedFocus / totalMins);
      } else {
        currentValue = 0;
      }
    }

    const progressPct = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
    const isAchieved = progressPct >= 100;
    if (isAchieved) achievedCount++;
    totalProgressPctSum += progressPct;

    return {
      _id: goal._id,
      title: goal.title,
      category: goal.category,
      targetType: goal.targetType,
      targetValue: goal.targetValue,
      currentValue,
      progressPct,
      period: goal.period,
      startDate: goal.startDate,
      endDate: goal.endDate,
      status: isAchieved ? 'achieved' : goal.status,
      unit: goal.targetType === 'hours' ? 'hrs' : goal.targetType === 'sessions' ? 'sessions' : 'pts',
    };
  });

  const overallCompletionRate = Math.round(totalProgressPctSum / goals.length);

  return {
    totalGoals: goals.length,
    achievedCount,
    activeGoals,
    overallCompletionRate,
  };
}
