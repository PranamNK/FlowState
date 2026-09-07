/**
 * Pure calculation module for Planned vs Actual Analysis.
 * Evaluates schedule adherence, start delay, duration overrun, and completion rates.
 */

export function calculatePlannedVsActual(activities = []) {
  const plannedActivities = activities.filter((a) => a.isPlanned || a.plannedStartTime || a.plannedDurationMinutes);

  if (!plannedActivities || plannedActivities.length === 0) {
    return {
      hasPlannedData: false,
      totalPlannedSessions: 0,
      completionRate: 0,
      averageStartDelayMinutes: 0,
      totalOverrunMinutes: 0,
      comparisons: [],
      observation: 'No planned sessions scheduled for this period.',
    };
  }

  let totalPlannedMinutes = 0;
  let totalActualMinutes = 0;
  let totalStartDelay = 0;
  let overrunMinutes = 0;
  let completedCount = 0;

  const comparisons = plannedActivities.map((act) => {
    const plannedDur =
      act.plannedDurationMinutes ||
      (act.plannedEndTime && act.plannedStartTime
        ? Math.max(1, Math.round((new Date(act.plannedEndTime) - new Date(act.plannedStartTime)) / 60000))
        : act.durationMinutes);

    const actualDur = act.durationMinutes || 0;
    totalPlannedMinutes += plannedDur;
    totalActualMinutes += actualDur;

    let startDelay = 0;
    if (act.plannedStartTime && act.startTime) {
      startDelay = Math.round((new Date(act.startTime) - new Date(act.plannedStartTime)) / 60000);
      totalStartDelay += Math.max(0, startDelay);
    }

    const variance = actualDur - plannedDur;
    if (variance > 0) {
      overrunMinutes += variance;
    }

    if (act.outcome === 'completed') {
      completedCount++;
    }

    return {
      activityId: act._id,
      title: act.title,
      category: act.category,
      plannedStartTime: act.plannedStartTime || act.startTime,
      actualStartTime: act.startTime,
      plannedDurationMinutes: plannedDur,
      actualDurationMinutes: actualDur,
      startDelayMinutes: startDelay,
      durationVarianceMinutes: variance,
      isOverrun: variance > 10,
      isDelayed: startDelay > 10,
      outcome: act.outcome,
    };
  });

  const completionRate = Math.round((completedCount / plannedActivities.length) * 100);
  const avgStartDelay = Math.round(totalStartDelay / plannedActivities.length);

  // Generate objective, non-judgmental observation
  let observation = '';
  if (completionRate >= 80 && avgStartDelay <= 10) {
    observation = `Strong execution: ${completionRate}% of planned blocks were completed with minimal start delay (${avgStartDelay}m avg).`;
  } else if (overrunMinutes > 45) {
    observation = `Sessions ran an aggregate of ${overrunMinutes}m longer than planned, causing downstream schedule shifts.`;
  } else if (avgStartDelay > 15) {
    observation = `Planned blocks experienced an average initial delay of ${avgStartDelay}m before starting.`;
  } else {
    observation = `${completedCount} of ${plannedActivities.length} planned activities completed as expected.`;
  }

  return {
    hasPlannedData: true,
    totalPlannedSessions: plannedActivities.length,
    completionRate,
    averageStartDelayMinutes: avgStartDelay,
    totalPlannedMinutes,
    totalActualMinutes,
    totalOverrunMinutes: overrunMinutes,
    comparisons,
    observation,
  };
}
