import * as activityService from '../services/activityService.js';

export async function createActivity(req, res, next) {
  try {
    const activity = await activityService.createActivity(req.user._id, req.body);
    res.status(201).json({ success: true, activity });
  } catch (err) {
    next(err);
  }
}

export async function getActivities(req, res, next) {
  try {
    const { startDate, endDate, category, limit } = req.query;
    const activities = await activityService.getActivities(req.user._id, { startDate, endDate, category, limit });
    res.status(200).json({ success: true, count: activities.length, activities });
  } catch (err) {
    next(err);
  }
}

export async function getActivityById(req, res, next) {
  try {
    const activity = await activityService.getActivityById(req.user._id, req.params.id);
    res.status(200).json({ success: true, activity });
  } catch (err) {
    next(err);
  }
}

export async function updateActivity(req, res, next) {
  try {
    const activity = await activityService.updateActivity(req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, activity });
  } catch (err) {
    next(err);
  }
}

export async function deleteActivity(req, res, next) {
  try {
    const result = await activityService.deleteActivity(req.user._id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
