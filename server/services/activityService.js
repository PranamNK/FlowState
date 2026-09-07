import Activity from '../models/Activity.js';

export async function createActivity(userId, activityData) {
  const {
    title,
    category = 'Other',
    isPlanned = false,
    plannedStartTime,
    plannedEndTime,
    plannedDurationMinutes,
    startTime,
    endTime,
    focusScore = 70,
    energyScore = 70,
    outcome = 'completed',
    notes = '',
    source = 'manual',
  } = activityData;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const err = new Error('Invalid start or end time format.');
    err.statusCode = 400;
    throw err;
  }

  if (end <= start) {
    const err = new Error('End time must be strictly after start time.');
    err.statusCode = 400;
    throw err;
  }

  const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

  const activity = await Activity.create({
    userId,
    title,
    category,
    isPlanned,
    plannedStartTime: plannedStartTime ? new Date(plannedStartTime) : null,
    plannedEndTime: plannedEndTime ? new Date(plannedEndTime) : null,
    plannedDurationMinutes: plannedDurationMinutes || null,
    startTime: start,
    endTime: end,
    durationMinutes,
    focusScore: Number(focusScore),
    energyScore: Number(energyScore),
    outcome,
    notes,
    source,
  });

  return activity;
}

export async function getActivities(userId, { startDate, endDate, category, limit = 100 }) {
  const query = { userId };

  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) query.startTime.$gte = new Date(startDate);
    if (endDate) query.startTime.$lte = new Date(endDate);
  }

  if (category) {
    query.category = category;
  }

  return Activity.find(query)
    .sort({ startTime: -1 })
    .limit(Number(limit));
}

export async function getActivityById(userId, activityId) {
  const activity = await Activity.findOne({ _id: activityId, userId });
  if (!activity) {
    const err = new Error('Activity not found.');
    err.statusCode = 404;
    throw err;
  }
  return activity;
}

export async function updateActivity(userId, activityId, updateData) {
  const activity = await Activity.findOne({ _id: activityId, userId });
  if (!activity) {
    const err = new Error('Activity not found.');
    err.statusCode = 404;
    throw err;
  }

  if (updateData.startTime || updateData.endTime) {
    const start = new Date(updateData.startTime || activity.startTime);
    const end = new Date(updateData.endTime || activity.endTime);
    if (end <= start) {
      const err = new Error('End time must be strictly after start time.');
      err.statusCode = 400;
      throw err;
    }
    updateData.durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    updateData.startTime = start;
    updateData.endTime = end;
  }

  Object.assign(activity, updateData);
  await activity.save();
  return activity;
}

export async function deleteActivity(userId, activityId) {
  const activity = await Activity.findOneAndDelete({ _id: activityId, userId });
  if (!activity) {
    const err = new Error('Activity not found.');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Activity successfully removed.' };
}
