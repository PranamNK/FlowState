import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { AnalyticsPayload } from '../types';
import { BaselineComparisonCard } from '../components/analytics/BaselineComparisonCard';
import { CategoryChart } from '../components/analytics/CategoryChart';
import { FocusHeatmap } from '../components/analytics/FocusHeatmap';
import { PlannedVsActualCard } from '../components/analytics/PlannedVsActualCard';
import { WeeklyTrendChart } from '../components/analytics/WeeklyTrendChart';
import { Clock, Focus, Shuffle, Flame } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);

  const loadAnalytics = async () => {
    try {
      const endpoint = period === 'weekly' ? '/analytics/weekly' : '/analytics/monthly';
      const res = await api.get<{ success: boolean; analytics: AnalyticsPayload }>(endpoint);
      if (res.success && res.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const summary = analytics?.summary;

  return (
    <div className="page-wrapper">
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2px' }}>
            Time Intelligence & Analytics
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Deep patterns, personal baselines, and execution velocity
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            padding: '3px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            className={`btn btn-sm ${period === 'weekly' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ border: 'none' }}
            onClick={() => setPeriod('weekly')}
          >
            Weekly Review
          </button>
          <button
            className={`btn btn-sm ${period === 'monthly' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ border: 'none' }}
            onClick={() => setPeriod('monthly')}
          >
            Monthly Horizon
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Period Time</span>
            <Clock size={16} color="var(--accent-primary)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {summary ? `${summary.totalTrackedHours}h` : '0h'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {summary?.totalActivities || 0} sessions completed
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Net Focus Time</span>
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Deep Work Rate</span>
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
            {summary ? `${summary.switchRatePerHour}/hr avg switch rate` : '0/hr'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <BaselineComparisonCard
          comparison={analytics?.baselineComparison}
          daysTracked={analytics?.baseline?.daysTracked || 0}
        />
      </div>

      {period === 'weekly' && analytics?.dailyTrends && (
        <div style={{ marginBottom: '24px' }}>
          <WeeklyTrendChart dailyTrends={analytics.dailyTrends} />
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '24px', alignItems: 'stretch' }}>
        <CategoryChart categories={analytics?.categoryBreakdown || []} />
        {analytics && (
          <FocusHeatmap
            hourlyDistribution={analytics.focusAnalysis.hourlyDistribution}
            bestFocusWindow={analytics.focusAnalysis.bestFocusWindow}
            lowestFocusWindow={analytics.focusAnalysis.lowestFocusWindow}
          />
        )}
      </div>

      {analytics && (
        <PlannedVsActualCard
          hasPlannedData={analytics.plannedVsActual.hasPlannedData}
          completionRate={analytics.plannedVsActual.completionRate}
          averageStartDelayMinutes={analytics.plannedVsActual.averageStartDelayMinutes}
          totalOverrunMinutes={analytics.plannedVsActual.totalOverrunMinutes}
          comparisons={analytics.plannedVsActual.comparisons}
          observation={analytics.plannedVsActual.observation}
        />
      )}
    </div>
  );
};
