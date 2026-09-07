import Activity from '../models/Activity.js';
import Goal from '../models/Goal.js';
import { aggregatePeriodAnalytics } from '../analytics/index.js';

export async function getDailyAnalytics(userId, targetDate = new Date()) {
  const dateObj = new Date(targetDate);
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const thirtyDaysPrior = new Date(startOfDay);
  thirtyDaysPrior.setDate(thirtyDaysPrior.getDate() - 30);

  const [todayActivities, historicalActivities, goals] = await Promise.all([
    Activity.find({
      userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ startTime: 1 }),
    Activity.find({
      userId,
      startTime: { $gte: thirtyDaysPrior, $lt: startOfDay },
    }).sort({ startTime: 1 }),
    Goal.find({
      userId,
      status: 'active',
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    }),
  ]);

  return aggregatePeriodAnalytics({
    period: 'daily',
    activities: todayActivities,
    historicalActivities,
    goals,
    dateRange: { start: startOfDay, end: endOfDay },
  });
}

export async function getWeeklyAnalytics(userId, weekStart = null) {
  const start = weekStart ? new Date(weekStart) : new Date();
  if (!weekStart) {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
  }
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const sixtyDaysPrior = new Date(start);
  sixtyDaysPrior.setDate(sixtyDaysPrior.getDate() - 60);

  const [weekActivities, historicalActivities, goals] = await Promise.all([
    Activity.find({
      userId,
      startTime: { $gte: start, $lte: end },
    }).sort({ startTime: 1 }),
    Activity.find({
      userId,
      startTime: { $gte: sixtyDaysPrior, $lt: start },
    }).sort({ startTime: 1 }),
    Goal.find({
      userId,
      status: 'active',
      startDate: { $lte: end },
      endDate: { $gte: start },
    }),
  ]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyTrends = daysOfWeek.map((dayName, index) => {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + index);
    const dayDateStr = dayDate.toISOString().split('T')[0];

    const dayActs = weekActivities.filter(
      (a) => new Date(a.startTime).toISOString().split('T')[0] === dayDateStr
    );

    const totalMins = dayActs.reduce((s, a) => s + (a.durationMinutes || 0), 0);
    const focusMins = dayActs
      .filter((a) => !['break', 'rest'].includes((a.category || '').toLowerCase()))
      .reduce((s, a) => s + (a.durationMinutes || 0), 0);
    const deepWorkMins = dayActs
      .filter((a) => (a.focusScore || 70) >= 75 && (a.durationMinutes || 0) >= 25)
      .reduce((s, a) => s + (a.durationMinutes || 0), 0);

    return {
      day: dayName,
      date: dayDateStr,
      totalHours: Number((totalMins / 60).toFixed(1)),
      focusHours: Number((focusMins / 60).toFixed(1)),
      deepWorkHours: Number((deepWorkMins / 60).toFixed(1)),
      activitiesCount: dayActs.length,
    };
  });

  const baseAgg = aggregatePeriodAnalytics({
    period: 'weekly',
    activities: weekActivities,
    historicalActivities,
    goals,
    dateRange: { start, end },
  });

  return {
    ...baseAgg,
    dailyTrends,
  };
}

export async function getMonthlyAnalytics(userId, year = null, month = null) {
  const now = new Date();
  const targetYear = year !== null ? Number(year) : now.getFullYear();
  const targetMonth = month !== null ? Number(month) : now.getMonth();

  const start = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
  const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  const ninetyDaysPrior = new Date(start);
  ninetyDaysPrior.setDate(ninetyDaysPrior.getDate() - 90);

  const [monthActivities, historicalActivities, goals] = await Promise.all([
    Activity.find({
      userId,
      startTime: { $gte: start, $lte: end },
    }).sort({ startTime: 1 }),
    Activity.find({
      userId,
      startTime: { $gte: ninetyDaysPrior, $lt: start },
    }).sort({ startTime: 1 }),
    Goal.find({
      userId,
      status: 'active',
      startDate: { $lte: end },
      endDate: { $gte: start },
    }),
  ]);

  return aggregatePeriodAnalytics({
    period: 'monthly',
    activities: monthActivities,
    historicalActivities,
    goals,
    dateRange: { start, end },
  });
}
