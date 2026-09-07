import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Activity, AnalyticsPayload, Insight, Goal } from '../types';
import { FlowScoreDial } from '../components/analytics/FlowScoreDial';
import { BaselineComparisonCard } from '../components/analytics/BaselineComparisonCard';
import { Timeline } from '../components/activities/Timeline';
import { InsightCard } from '../components/insights/InsightCard';
import { GoalCard } from '../components/goals/GoalCard';
import { FocusHeatmap } from '../components/analytics/FocusHeatmap';
import {
  Clock,
  Focus,
  Shuffle,
  Flame,
  Plus,
  RefreshCw,
  Target,
  Bot,
} from 'lucide-react';
import { formatDateLabel } from '../utils/formatters';

interface DashboardPageProps {
  onOpenActivityModal: (activity?: Activity | null) => void;
  onOpenStartSessionModal: () => void;
  onOpenGoalModal: () => void;
  onSelectTab: (tab: 'dashboard' | 'timeline' | 'analytics' | 'goals') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenActivityModal,
  onOpenGoalModal,
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [actRes, anaRes, insRes, goalRes] = await Promise.all([
        api.get<{ success: boolean; activities: Activity[] }>('/activities', {
          startDate: `${selectedDate}T00:00:00.000Z`,
          endDate: `${selectedDate}T23:59:59.999Z`,
        }),
        api.get<{ success: boolean; analytics: AnalyticsPayload }>('/analytics/daily', {
          date: selectedDate,
        }),
        api.get<{ success: boolean; insights: Insight[] }>('/insights', {
          period: 'daily',
          mode: 'deterministic',
        }),
        api.get<{ success: boolean; goals: Goal[] }>('/goals'),
      ]);

      if (actRes.success) setActivities(actRes.activities);
      if (anaRes.success) setAnalytics(anaRes.analytics);
      if (insRes.success) setInsights(insRes.insights);
      if (goalRes.success) setGoals(goalRes.goals);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const handleGenerateAIInsights = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await api.get<{ success: boolean; insights: Insight[] }>('/insights', {
        period: 'daily',
        mode: 'ai',
      });
      if (res.success && res.insights) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error('Failed to generate AI insights:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm('Delete this activity?')) {
      await api.delete(`/activities/${id}`);
      loadDashboardData();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Remove this goal?')) {
      await api.delete(`/goals/${id}`);
      loadDashboardData();
    }
  };

  const summary = analytics?.summary;

  return (
    <div className="page-wrapper">
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2px' }}>
            Good day, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {formatDateLabel(selectedDate)} • Track your flow, understand your patterns.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
          />

          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={loadDashboardData}
            title="Refresh Metrics"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Tracked</span>
            <Clock size={16} color="var(--accent-primary)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {summary ? `${summary.totalTrackedHours}h` : '0h'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {activities.length} session{activities.length === 1 ? '' : 's'} recorded
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Focus Time</span>
            <Focus size={16} color="var(--accent-success)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-success)' }}>
            {summary ? `${summary.focusedHours}h` : '0h'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Avg focus {summary?.averageFocusScore || 0}/100
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Deep Work Ratio</span>
            <Flame size={16} color="var(--accent-primary)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {summary ? `${summary.deepWorkRatio}%` : '0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {summary ? `${Math.round((summary.deepWorkMinutes || 0) / 60 * 10) / 10}h high focus` : '0h'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Context Switches</span>
            <Shuffle size={16} color="var(--accent-warning)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
            {summary ? summary.contextSwitches : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {summary ? `${summary.switchRatePerHour}/hr switch rate` : '0/hr'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <BaselineComparisonCard
          comparison={analytics?.baselineComparison}
          daysTracked={analytics?.baseline?.daysTracked || 0}
        />
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FlowScoreDial
            score={summary?.flowScore || 0}
            breakdown={summary?.flowScoreBreakdown}
          />

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Clock size={16} color="var(--accent-primary)" /> Daily Timeline
                </div>
                <div className="card-subtitle">Chronological record of activities & outcomes</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenActivityModal(null)}
              >
                <Plus size={14} /> Add Block
              </button>
            </div>

            <Timeline
              activities={activities}
              onEdit={(act) => onOpenActivityModal(act)}
              onDelete={handleDeleteActivity}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Bot size={16} color="var(--accent-primary)" /> Daily Pattern Intelligence
                </div>
                <div className="card-subtitle">Data-backed observations & micro-experiments</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleGenerateAIInsights}
                disabled={isGeneratingAI}
                title="Generate natural language explanation via Groq Llama 3.3"
              >
                <Bot size={14} color="var(--accent-primary)" />
                {isGeneratingAI ? 'Analyzing...' : 'Groq AI Insights'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {insights.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  Log activities today to generate pattern observations.
                </div>
              ) : (
                insights.map((ins, idx) => <InsightCard key={ins._id || idx} insight={ins} />)
              )}
            </div>
          </div>

          {analytics && (
            <FocusHeatmap
              hourlyDistribution={analytics.focusAnalysis.hourlyDistribution}
              bestFocusWindow={analytics.focusAnalysis.bestFocusWindow}
              lowestFocusWindow={analytics.focusAnalysis.lowestFocusWindow}
            />
          )}

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Target size={16} color="var(--accent-primary)" /> Active Targets
                </div>
                <div className="card-subtitle">Progress toward weekly & monthly horizons</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onOpenGoalModal}>
                <Plus size={14} /> New Goal
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {goals.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  No active goals set.{' '}
                  <span
                    style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={onOpenGoalModal}
                  >
                    Create a target
                  </span>{' '}
                  to guide your focus.
                </div>
              ) : (
                goals.slice(0, 3).map((g) => <GoalCard key={g._id} goal={g} onDelete={handleDeleteGoal} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
