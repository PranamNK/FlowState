import * as sessionService from '../services/sessionService.js';

function emitSessionUpdate(req, eventName, data) {
  const io = req.app.get('io');
  if (io && req.user) {
    io.to(`user_${req.user._id}`).emit(eventName, data);
  }
}

export async function startSession(req, res, next) {
  try {
    const { title, category, focusScore, energyScore } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Session title is required.' });
    }
    const session = await sessionService.startSession(req.user._id, { title, category, focusScore, energyScore });
    emitSessionUpdate(req, 'session:started', session);
    res.status(201).json({ success: true, session });
  } catch (err) {
    next(err);
  }
}

export async function pauseSession(req, res, next) {
  try {
    const session = await sessionService.pauseSession(req.user._id, req.params.id);
    emitSessionUpdate(req, 'session:paused', session);
    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
}

export async function resumeSession(req, res, next) {
  try {
    const session = await sessionService.resumeSession(req.user._id, req.params.id);
    emitSessionUpdate(req, 'session:resumed', session);
    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
}

export async function finishSession(req, res, next) {
  try {
    const result = await sessionService.finishSession(req.user._id, req.params.id, req.body);
    emitSessionUpdate(req, 'session:finished', result);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function cancelSession(req, res, next) {
  try {
    const session = await sessionService.cancelSession(req.user._id, req.params.id);
    emitSessionUpdate(req, 'session:cancelled', session);
    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
}

export async function getActiveSession(req, res, next) {
  try {
    const activeData = await sessionService.getActiveSession(req.user._id);
    res.status(200).json({ success: true, active: activeData });
  } catch (err) {
    next(err);
  }
}
