import Session from '../models/Session.js';
import Activity from '../models/Activity.js';

export async function startSession(userId, { title, category = 'Development', focusScore = 80, energyScore = 80 }) {
  const existing = await Session.findOne({
    userId,
    status: { $in: ['active', 'paused'] },
  });

  if (existing) {
    existing.status = 'cancelled';
    existing.endedAt = new Date();
    await existing.save();
  }

  const session = await Session.create({
    userId,
    title,
    category,
    status: 'active',
    startedAt: new Date(),
    pausedAt: null,
    accumulatedSeconds: 0,
    focusScore,
    energyScore,
  });

  return session;
}

export async function pauseSession(userId, sessionId) {
  const session = await Session.findOne({ _id: sessionId, userId, status: 'active' });
  if (!session) {
    const err = new Error('No active session found to pause.');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const segmentSeconds = Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000));
  
  session.accumulatedSeconds += segmentSeconds;
  session.pausedAt = now;
  session.status = 'paused';
  await session.save();

  return session;
}

export async function resumeSession(userId, sessionId) {
  const session = await Session.findOne({ _id: sessionId, userId, status: 'paused' });
  if (!session) {
    const err = new Error('No paused session found to resume.');
    err.statusCode = 404;
    throw err;
  }

  session.startedAt = new Date();
  session.pausedAt = null;
  session.status = 'active';
  await session.save();

  return session;
}

export async function finishSession(userId, sessionId, finalData = {}) {
  const session = await Session.findOne({
    _id: sessionId,
    userId,
    status: { $in: ['active', 'paused'] },
  });

  if (!session) {
    const err = new Error('No active/paused session found to finish.');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  let totalSeconds = session.accumulatedSeconds;

  if (session.status === 'active') {
    const currentSegmentSeconds = Math.max(
      0,
      Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000)
    );
    totalSeconds += currentSegmentSeconds;
  }

  const durationMinutes = Math.max(1, Math.round(totalSeconds / 60));
  const startTime = new Date(now.getTime() - totalSeconds * 1000);

  const activity = await Activity.create({
    userId,
    title: finalData.title || session.title,
    category: finalData.category || session.category,
    startTime,
    endTime: now,
    durationMinutes,
    focusScore: Number(finalData.focusScore || session.focusScore || 80),
    energyScore: Number(finalData.energyScore || session.energyScore || 80),
    outcome: finalData.outcome || 'completed',
    notes: finalData.notes || session.notes || '',
    source: 'session',
  });

  session.status = 'completed';
  session.endedAt = now;
  session.accumulatedSeconds = totalSeconds;
  session.activityId = activity._id;
  await session.save();

  return {
    session,
    activity,
  };
}

export async function cancelSession(userId, sessionId) {
  const session = await Session.findOne({
    _id: sessionId,
    userId,
    status: { $in: ['active', 'paused'] },
  });

  if (!session) {
    const err = new Error('No active/paused session found to cancel.');
    err.statusCode = 404;
    throw err;
  }

  session.status = 'cancelled';
  session.endedAt = new Date();
  await session.save();

  return session;
}

export async function getActiveSession(userId) {
  const session = await Session.findOne({
    userId,
    status: { $in: ['active', 'paused'] },
  });

  if (!session) {
    return null;
  }

  let currentElapsedSeconds = session.accumulatedSeconds;
  if (session.status === 'active') {
    const now = new Date();
    const currentSegment = Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000));
    currentElapsedSeconds += currentSegment;
  }

  return {
    session,
    currentElapsedSeconds,
  };
}
