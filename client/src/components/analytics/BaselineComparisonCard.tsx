import React from 'react';
import type { BaselineComparison } from '../../types';
import { Compass, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface BaselineComparisonCardProps {
  comparison?: BaselineComparison;
  daysTracked?: number;
}

export const BaselineComparisonCard: React.FC<BaselineComparisonCardProps> = ({
  comparison,
  daysTracked = 0,
}) => {
  if (!comparison || !comparison.hasComparison) {
    return (
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--accent-info)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 20px',
        }}
      >
        <Info size={20} color="var(--accent-info)" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Personal Baseline Calibration
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            FLOWSTATE compares you against your <strong>own historical patterns</strong> rather than arbitrary benchmarks.
            Track {Math.max(1, 3 - daysTracked)} more day{3 - daysTracked === 1 ? '' : 's'} to establish your baseline.
          </div>
        </div>
      </div>
    );
  }

  const renderMetric = (label: string, metric: any) => {
    if (!metric) return null;
    const isGood = metric.direction === 'better';
    const isNeutral = metric.direction === 'neutral';

    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isNeutral ? (
            <Minus size={14} color="var(--text-tertiary)" />
          ) : isGood ? (
            <TrendingUp size={15} color="var(--accent-success)" />
          ) : (
            <TrendingDown size={15} color="var(--accent-warning)" />
          )}
          <span
            className="mono"
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: isNeutral ? 'var(--text-primary)' : isGood ? 'var(--accent-success)' : 'var(--accent-warning)',
            }}
          >
            {metric.text}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: '12px' }}>
        <div>
          <div className="card-title">
            <Compass size={16} color="var(--accent-primary)" /> Personal Baseline Comparison
          </div>
          <div className="card-subtitle">
            Relative to your 30-day historical average ({daysTracked} days tracked)
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '12px' }}>
        {renderMetric('Focus Duration', comparison.focus)}
        {renderMetric('FlowScore Rating', comparison.score)}
        {renderMetric('Context Switches', comparison.contextSwitches)}
      </div>
    </div>
  );
};
