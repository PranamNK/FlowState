import * as goalService from '../services/goalService.js';

export async function createGoal(req, res, next) {
  try {
    const { title, targetValue } = req.body;
    if (!title || !targetValue) {
      return res.status(400).json({ success: false, message: 'Goal title and target value are required.' });
    }
    const goal = await goalService.createGoal(req.user._id, req.body);
    res.status(201).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
}

export async function getGoals(req, res, next) {
  try {
    const goals = await goalService.getGoalsWithProgress(req.user._id);
    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (err) {
    next(err);
  }
}

export async function updateGoal(req, res, next) {
  try {
    const goal = await goalService.updateGoal(req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const result = await goalService.deleteGoal(req.user._id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
