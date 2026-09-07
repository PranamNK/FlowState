import * as analyticsService from '../services/analyticsService.js';

export async function getDaily(req, res, next) {
  try {
    const { date } = req.query;
    const analytics = await analyticsService.getDailyAnalytics(req.user._id, date);
    res.status(200).json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
}

export async function getWeekly(req, res, next) {
  try {
    const { weekStart } = req.query;
    const analytics = await analyticsService.getWeeklyAnalytics(req.user._id, weekStart);
    res.status(200).json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
}

export async function getMonthly(req, res, next) {
  try {
    const { year, month } = req.query;
    const analytics = await analyticsService.getMonthlyAnalytics(req.user._id, year, month);
    res.status(200).json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
}
