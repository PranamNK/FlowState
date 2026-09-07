export interface User {
  _id: string;
  name: string;
  email: string;
  timezone: string;
  preferences?: {
    theme?: 'dark' | 'light';
    workHoursStart?: string;
    workHoursEnd?: string;
    baselinePeriodDays?: number;
  };
  createdAt?: string;
}

export type ActivityCategory =
  | 'Development'
  | 'Study'
  | 'College'
  | 'Work'
  | 'Exercise'
  | 'Reading'
  | 'Planning'
  | 'Break'
  | 'Entertainment'
  | 'Social'
  | 'Other';

export type ActivityOutcome =
  | 'completed'
  | 'partially_completed'
  | 'interrupted'
  | 'abandoned';

export interface Activity {
  _id: string;
  userId: string;
  title: string;
  category: ActivityCategory | string;
  isPlanned?: boolean;
  plannedStartTime?: string | null;
  plannedEndTime?: string | null;
  plannedDurationMinutes?: number | null;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  focusScore: number;
  energyScore: number;
  outcome: ActivityOutcome;
  notes?: string;
  source?: 'manual' | 'session' | 'integration';
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  _id: string;
  userId: string;
  title: string;
  category: string;
  activityId?: string | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startedAt: string;
  pausedAt?: string | null;
  endedAt?: string | null;
  accumulatedSeconds: number;
  focusScore?: number;
  energyScore?: number;
  outcome?: ActivityOutcome;
  notes?: string;
}

export interface Goal {
  _id: string;
  title: string;
  category?: string | null;
  targetType: 'hours' | 'sessions' | 'focus_score';
  targetValue: number;
  currentValue?: number;
  progressPct?: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'achieved' | 'missed' | 'archived';
  unit?: string;
}

export interface FlowScoreBreakdown {
  focus: number;
  goalAlignment: number;
  outcome: number;
  consistency: number;
  energy: number;
}

export interface BaselineMetricComparison {
  diffPct: number;
  direction: 'better' | 'worse' | 'neutral';
  text: string;
  rawDiff?: number;
}

export interface BaselineComparison {
  hasComparison: boolean;
  message?: string;
  focus?: BaselineMetricComparison;
  score?: BaselineMetricComparison;
  contextSwitches?: BaselineMetricComparison;
  summarySentence?: string;
}

export interface CategoryBreakdownItem {
  category: string;
  minutes: number;
  hours: number;
  percentage: number;
  sessionCount: number;
  avgSessionMinutes: number;
  avgFocusScore: number;
  avgEnergyScore: number;
  completionRate: number;
}

export interface PlannedVsActualComparison {
  activityId: string;
  title: string;
  category: string;
  plannedStartTime: string;
  actualStartTime: string;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  startDelayMinutes: number;
  durationVarianceMinutes: number;
  isOverrun: boolean;
  isDelayed: boolean;
  outcome: ActivityOutcome;
}

export interface AnalyticsPayload {
  period: 'daily' | 'weekly' | 'monthly';
  dateRange: { start: string; end: string };
  summary: {
    flowScore: number;
    flowScoreBreakdown: FlowScoreBreakdown;
    totalTrackedMinutes: number;
    totalTrackedHours: number;
    focusedMinutes: number;
    focusedHours: number;
    breakMinutes: number;
    breakHours: number;
    deepWorkMinutes: number;
    deepWorkRatio: number;
    averageFocusScore: number;
    totalActivities: number;
    contextSwitches: number;
    switchRatePerHour: number;
  };
  focusAnalysis: {
    totalTrackedMinutes: number;
    deepWorkMinutes: number;
    deepWorkRatio: number;
    averageFocusScore: number;
    hourlyDistribution: Array<{
      hour: number;
      hourLabel: string;
      trackedMinutes: number;
      averageFocus: number;
    }>;
    bestFocusWindow: string;
    lowestFocusWindow: string;
  };
  contextSwitching: {
    totalSwitches: number;
    switchRatePerHour: number;
    switches: Array<{
      fromCategory: string;
      toCategory: string;
      time: string;
      gapMinutes: number;
    }>;
    categoryBreakdown: CategoryBreakdownItem[];
    highFrequencyWarning: boolean;
  };
  categoryBreakdown: CategoryBreakdownItem[];
  plannedVsActual: {
    hasPlannedData: boolean;
    totalPlannedSessions: number;
    completionRate: number;
    averageStartDelayMinutes: number;
    totalPlannedMinutes: number;
    totalActualMinutes: number;
    totalOverrunMinutes: number;
    comparisons: PlannedVsActualComparison[];
    observation: string;
  };
  baseline: {
    hasBaseline: boolean;
    periodDays: number;
    daysTracked: number;
    avgDailyFocusMinutes: number;
    avgDailyTrackedMinutes: number;
    avgDailyFlowScore: number;
    avgSessionMinutes: number;
    avgDailyContextSwitches: number;
  };
  baselineComparison: BaselineComparison;
  goals: {
    totalGoals: number;
    achievedCount: number;
    activeGoals: Goal[];
    overallCompletionRate: number;
  };
  dailyTrends?: Array<{
    day: string;
    date: string;
    totalHours: number;
    focusHours: number;
    deepWorkHours: number;
    activitiesCount: number;
  }>;
}

export interface Insight {
  _id?: string;
  userId?: string;
  period: 'daily' | 'weekly' | 'monthly';
  type: 'trend' | 'baseline_comparison' | 'peak_focus' | 'context_switch' | 'goal_progress' | 'recommendation' | 'planned_vs_actual';
  title: string;
  description: string;
  severity: 'positive' | 'neutral' | 'attention';
  supportingMetrics?: Record<string, any>;
  generatedBy: 'rules' | 'gemini';
  createdAt?: string;
}
