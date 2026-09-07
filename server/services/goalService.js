import Goal from '../models/Goal.js';
import Activity from '../models/Activity.js';
import { calculateGoalProgress } from '../analytics/goalAnalysis.js';

export async function createGoal(userId, goalData) {
  const { title, category, targetType = 'hours', targetValue, period = 'weekly', startDate, endDate } = goalData;

  const start = startDate ? new Date(startDate) : new Date();
  let end = endDate ? new Date(endDate) : null;

  if (!end) {
    end = new Date(start);
    if (period === 'daily') {
      end.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
      end.setDate(end.getDate() + 7);
    } else if (period === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    }
  }

  const goal = await Goal.create({
    userId,
    title,
    category: category || null,
    targetType,
    targetValue: Number(targetValue),
    period,
    startDate: start,
    endDate: end,
    status: 'active',
  });

  return goal;
}

export async function getGoalsWithProgress(userId) {
  const goals = await Goal.find({ userId, status: { $ne: 'archived' } }).sort({ createdAt: -1 });
  if (goals.length === 0) {
    return [];
  }

  const earliest = new Date(Math.min(...goals.map((g) => new Date(g.startDate).getTime())));
  const latest = new Date(Math.max(...goals.map((g) => new Date(g.endDate).getTime())));

  const activities = await Activity.find({
    userId,
    startTime: { $gte: earliest, $lte: latest },
  });

  const progressResult = calculateGoalProgress(goals, activities);
  return progressResult.activeGoals;
}

export async function updateGoal(userId, goalId, updateData) {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    const err = new Error('Goal not found.');
    err.statusCode = 404;
    throw err;
  }

  Object.assign(goal, updateData);
  await goal.save();
  return goal;
}

export async function deleteGoal(userId, goalId) {
  const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
  if (!goal) {
    const err = new Error('Goal not found.');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Goal removed.' };
}
