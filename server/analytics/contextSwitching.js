/**
 * Pure calculation module for Context Switching detection and analysis.
 * Deterministic rule:
 * A context switch occurs when two chronologically adjacent activities belong
 * to different categories and neither transition is an intentional break.
 */

const BREAK_CATEGORIES = new Set(['Break', 'Rest', 'Lunch', 'Dinner', 'Pause']);

export function calculateContextSwitches(activities = []) {
  if (!activities || activities.length < 2) {
    return {
      totalSwitches: 0,
      switchRatePerHour: 0,
      switches: [],
      categoryBreakdown: calculateCategoryBreakdown(activities),
      highFrequencyWarning: false,
    };
  }

  // Sort chronologically by startTime
  const sorted = [...activities].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const switches = [];
  let totalTrackedMinutes = 0;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    totalTrackedMinutes += current.durationMinutes || 0;

    if (i > 0) {
      const prev = sorted[i - 1];
      const prevCat = prev.category || 'Other';
      const currentCat = current.category || 'Other';

      // Check if categories differ and neither is a standard break
      const isDifferent = prevCat.toLowerCase() !== currentCat.toLowerCase();
      const isBreakTransition = BREAK_CATEGORIES.has(prevCat) || BREAK_CATEGORIES.has(currentCat);

      if (isDifferent && !isBreakTransition) {
        switches.push({
          fromCategory: prevCat,
          toCategory: currentCat,
          time: current.startTime,
          gapMinutes: Math.max(
            0,
            Math.round((new Date(current.startTime) - new Date(prev.endTime)) / 60000)
          ),
        });
      }
    }
  }

  const trackedHours = totalTrackedMinutes / 60;
  const switchRatePerHour =
    trackedHours > 0 ? Number((switches.length / trackedHours).toFixed(2)) : 0;

  return {
    totalSwitches: switches.length,
    switchRatePerHour,
    switches,
    categoryBreakdown: calculateCategoryBreakdown(sorted),
    highFrequencyWarning: switchRatePerHour > 1.5, // Alert if switching more than 1.5x / hour
  };
}

export function calculateCategoryBreakdown(activities = []) {
  const breakdown = {};
  let totalMinutes = 0;

  for (const act of activities) {
    const cat = act.category || 'Other';
    const dur = act.durationMinutes || 0;
    totalMinutes += dur;

    if (!breakdown[cat]) {
      breakdown[cat] = {
        category: cat,
        minutes: 0,
        sessionsCount: 0,
        totalFocusSum: 0,
        totalEnergySum: 0,
        outcomes: { completed: 0, partially_completed: 0, interrupted: 0, abandoned: 0 },
      };
    }

    breakdown[cat].minutes += dur;
    breakdown[cat].sessionsCount += 1;
    breakdown[cat].totalFocusSum += (act.focusScore || 70) * dur;
    breakdown[cat].totalEnergySum += (act.energyScore || 70) * dur;
    if (act.outcome && breakdown[cat].outcomes[act.outcome] !== undefined) {
      breakdown[cat].outcomes[act.outcome] += 1;
    }
  }

  // Format into final list with percentages and averages
  return Object.values(breakdown).map((item) => ({
    category: item.category,
    minutes: item.minutes,
    hours: Number((item.minutes / 60).toFixed(1)),
    percentage: totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0,
    sessionCount: item.sessionsCount,
    avgSessionMinutes:
      item.sessionsCount > 0 ? Math.round(item.minutes / item.sessionsCount) : 0,
    avgFocusScore:
      item.minutes > 0 ? Math.round(item.totalFocusSum / item.minutes) : 70,
    avgEnergyScore:
      item.minutes > 0 ? Math.round(item.totalEnergySum / item.minutes) : 70,
    completionRate:
      item.sessionsCount > 0
        ? Math.round((item.outcomes.completed / item.sessionsCount) * 100)
        : 0,
  })).sort((a, b) => b.minutes - a.minutes);
}
