/**
 * Pure calculation module for Focus Quality, Heatmaps, and Peak Windows.
 */

export function calculateFocusAnalysis(activities = []) {
  if (!activities || activities.length === 0) {
    return {
      totalTrackedMinutes: 0,
      deepWorkMinutes: 0,
      deepWorkRatio: 0,
      averageFocusScore: 0,
      hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        hourLabel: `${String(i).padStart(2, '0')}:00`,
        trackedMinutes: 0,
        averageFocus: 0,
      })),
      bestFocusWindow: 'N/A',
      lowestFocusWindow: 'N/A',
    };
  }

  let totalTrackedMinutes = 0;
  let deepWorkMinutes = 0;
  let focusWeightedSum = 0;

  // Initialize 24-hour histogram
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    hourLabel: `${String(i).padStart(2, '0')}:00`,
    trackedMinutes: 0,
    focusMinutesProduct: 0,
  }));

  for (const act of activities) {
    const dur = act.durationMinutes || 0;
    const focus = act.focusScore || 70;

    totalTrackedMinutes += dur;
    focusWeightedSum += focus * dur;

    // Deep work definition: Focus >= 75 and duration >= 25 min and not a break
    const isBreak = ['break', 'rest'].includes((act.category || '').toLowerCase());
    if (!isBreak && focus >= 75 && dur >= 25) {
      deepWorkMinutes += dur;
    }

    // Distribute minutes across 24h timeline
    const start = new Date(act.startTime);
    const end = new Date(act.endTime);
    const startHour = start.getHours();
    const endHour = end.getHours();

    if (startHour === endHour) {
      hourlyData[startHour].trackedMinutes += dur;
      hourlyData[startHour].focusMinutesProduct += focus * dur;
    } else {
      // Split across multiple hours roughly
      const spanHours = Math.max(1, (end - start) / 3600000);
      const minsPerHour = dur / spanHours;
      for (let h = startHour; h <= Math.min(startHour + Math.ceil(spanHours), 23); h++) {
        hourlyData[h].trackedMinutes += minsPerHour;
        hourlyData[h].focusMinutesProduct += focus * minsPerHour;
      }
    }
  }

  // Format final hourly distribution
  const hourlyDistribution = hourlyData.map((h) => ({
    hour: h.hour,
    hourLabel: h.hourLabel,
    trackedMinutes: Math.round(h.trackedMinutes),
    averageFocus:
      h.trackedMinutes > 0
        ? Math.round(h.focusMinutesProduct / h.trackedMinutes)
        : 0,
  }));

  // Identify peak 3-hour focus window
  let bestWindowScore = -1;
  let bestWindowLabel = '09:00–12:00';
  let lowestWindowScore = 999999;
  let lowestWindowLabel = '14:00–17:00';

  // Check 3-hour sliding windows
  for (let startH = 6; startH <= 21; startH++) {
    const windowSlots = hourlyDistribution.slice(startH, startH + 3);
    const windowMinutes = windowSlots.reduce((s, w) => s + w.trackedMinutes, 0);
    if (windowMinutes >= 30) {
      const windowFocusAvg =
        windowSlots.reduce((s, w) => s + w.averageFocus * w.trackedMinutes, 0) /
        windowMinutes;

      if (windowFocusAvg > bestWindowScore) {
        bestWindowScore = windowFocusAvg;
        bestWindowLabel = `${String(startH).padStart(2, '0')}:00–${String(
          startH + 3
        ).padStart(2, '0')}:00`;
      }

      if (windowFocusAvg < lowestWindowScore) {
        lowestWindowScore = windowFocusAvg;
        lowestWindowLabel = `${String(startH).padStart(2, '0')}:00–${String(
          startH + 3
        ).padStart(2, '0')}:00`;
      }
    }
  }

  const avgFocus =
    totalTrackedMinutes > 0
      ? Math.round(focusWeightedSum / totalTrackedMinutes)
      : 0;

  const deepWorkRatio =
    totalTrackedMinutes > 0
      ? Math.round((deepWorkMinutes / totalTrackedMinutes) * 100)
      : 0;

  return {
    totalTrackedMinutes,
    deepWorkMinutes,
    deepWorkRatio,
    averageFocusScore: avgFocus,
    hourlyDistribution,
    bestFocusWindow: bestWindowScore >= 0 ? bestWindowLabel : '09:00–12:00',
    lowestFocusWindow: lowestWindowScore <= 100 ? lowestWindowLabel : '14:00–17:00',
  };
}
