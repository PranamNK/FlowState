import { describe, it, expect } from 'vitest';
import {
  calculateProductivityScore,
  calculateContextSwitches,
  calculateCategoryBreakdown,
  calculateFocusAnalysis,
  calculatePlannedVsActual,
  calculateBaseline,
  compareWithBaseline,
  calculateGoalProgress,
  aggregatePeriodAnalytics,
} from '../analytics/index.js';

describe('FLOWSTATE Pure Analytics Engine', () => {
  const sampleActivities = [
    {
      _id: '1',
      title: 'DSA Practice',
      category: 'Study',
      isPlanned: true,
      plannedStartTime: new Date('2026-09-07T09:00:00Z'),
      plannedDurationMinutes: 60,
      startTime: new Date('2026-09-07T09:10:00Z'),
      endTime: new Date('2026-09-07T10:10:00Z'),
      durationMinutes: 60,
      focusScore: 90,
      energyScore: 85,
      outcome: 'completed',
    },
    {
      _id: '2',
      title: 'Coffee Break',
      category: 'Break',
      isPlanned: false,
      startTime: new Date('2026-09-07T10:10:00Z'),
      endTime: new Date('2026-09-07T10:30:00Z'),
      durationMinutes: 20,
      focusScore: 40,
      energyScore: 70,
      outcome: 'completed',
    },
    {
      _id: '3',
      title: 'Full-Stack Engine Dev',
      category: 'Development',
      isPlanned: true,
      plannedStartTime: new Date('2026-09-07T10:30:00Z'),
      plannedDurationMinutes: 90,
      startTime: new Date('2026-09-07T10:30:00Z'),
      endTime: new Date('2026-09-07T12:00:00Z'),
      durationMinutes: 90,
      focusScore: 95,
      energyScore: 90,
      outcome: 'completed',
    },
    {
      _id: '4',
      title: 'Slack Catchup',
      category: 'Social',
      isPlanned: false,
      startTime: new Date('2026-09-07T12:00:00Z'),
      endTime: new Date('2026-09-07T12:30:00Z'),
      durationMinutes: 30,
      focusScore: 50,
      energyScore: 60,
      outcome: 'partially_completed',
    },
  ];

  it('calculates FlowScore with explainable breakdown', () => {
    const score = calculateProductivityScore({ activities: sampleActivities });
    expect(score.totalScore).toBeGreaterThan(0);
    expect(score.totalScore).toBeLessThanOrEqual(100);
    expect(score.breakdown).toHaveProperty('focus');
    expect(score.breakdown).toHaveProperty('goalAlignment');
    expect(score.breakdown).toHaveProperty('outcome');
    expect(score.breakdown).toHaveProperty('consistency');
    expect(score.breakdown).toHaveProperty('energy');
  });

  it('handles empty activity arrays gracefully', () => {
    const score = calculateProductivityScore({ activities: [] });
    expect(score.totalScore).toBe(0);
    expect(score.breakdown.focus).toBe(0);
  });

  it('detects context switching deterministically ignoring breaks', () => {
    // Sequence: Study -> Break -> Development -> Social
    // Study -> Development via Break: Break is not counted as switch target
    // Development -> Social: 1 switch
    const res = calculateContextSwitches(sampleActivities);
    expect(res.totalSwitches).toBeGreaterThanOrEqual(1);
    expect(res.switchRatePerHour).toBeGreaterThan(0);
  });

  it('computes category breakdowns with duration and percentages', () => {
    const breakdown = calculateCategoryBreakdown(sampleActivities);
    expect(breakdown.length).toBe(4);
    const devCat = breakdown.find((c) => c.category === 'Development');
    expect(devCat).toBeDefined();
    expect(devCat.minutes).toBe(90);
  });

  it('analyzes focus distribution and deep work ratio', () => {
    const focusRes = calculateFocusAnalysis(sampleActivities);
    expect(focusRes.totalTrackedMinutes).toBe(200);
    expect(focusRes.deepWorkMinutes).toBe(150); // 60 (Study) + 90 (Dev)
    expect(focusRes.deepWorkRatio).toBe(75);
    expect(focusRes.hourlyDistribution).toHaveLength(24);
  });

  it('analyzes planned vs actual delay and overruns', () => {
    const pva = calculatePlannedVsActual(sampleActivities);
    expect(pva.hasPlannedData).toBe(true);
    expect(pva.totalPlannedSessions).toBe(2);
    expect(pva.comparisons[0].startDelayMinutes).toBe(10);
    expect(pva.observation).toBeDefined();
  });

  it('computes personal baseline and relative comparison', () => {
    const baseline = calculateBaseline(sampleActivities, 7);
    expect(baseline.hasBaseline).toBe(false); // only 1 day tracked

    // Simulate 4 days of history
    const multiDayActs = [
      ...sampleActivities,
      { ...sampleActivities[0], startTime: new Date('2026-09-06T09:00:00Z'), endTime: new Date('2026-09-06T10:00:00Z') },
      { ...sampleActivities[0], startTime: new Date('2026-09-05T09:00:00Z'), endTime: new Date('2026-09-05T10:00:00Z') },
      { ...sampleActivities[0], startTime: new Date('2026-09-04T09:00:00Z'), endTime: new Date('2026-09-04T10:00:00Z') },
    ];
    const multiDayBaseline = calculateBaseline(multiDayActs, 7);
    expect(multiDayBaseline.hasBaseline).toBe(true);
    expect(multiDayBaseline.daysTracked).toBe(4);

    const comparison = compareWithBaseline(
      { focusedMinutes: 180, productivityScore: 88, contextSwitches: 2 },
      multiDayBaseline
    );
    expect(comparison.hasComparison).toBe(true);
    expect(comparison.focus.text).toBeDefined();
  });

  it('evaluates goal progress accurately', () => {
    const goals = [
      {
        _id: 'g1',
        title: 'Study DSA 2 hours',
        category: 'Study',
        targetType: 'hours',
        targetValue: 2,
        startDate: new Date('2026-09-01T00:00:00Z'),
        endDate: new Date('2026-09-10T00:00:00Z'),
        status: 'active',
      },
    ];

    const goalRes = calculateGoalProgress(goals, sampleActivities);
    expect(goalRes.totalGoals).toBe(1);
    expect(goalRes.activeGoals[0].currentValue).toBe(1); // 60 mins = 1 hr
    expect(goalRes.activeGoals[0].progressPct).toBe(50);
  });
});
