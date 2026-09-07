import React from 'react';
import type { FlowScoreBreakdown } from '../../types';
import { Zap, HelpCircle } from 'lucide-react';

interface FlowScoreDialProps {
  score: number;
  breakdown?: FlowScoreBreakdown;
}

export const FlowScoreDial: React.FC<FlowScoreDialProps> = ({ score, breakdown }) => {
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'var(--accent-success)';
    if (val >= 60) return 'var(--accent-primary)';
    if (val >= 40) return 'var(--accent-warning)';
    return 'var(--text-tertiary)';
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header">
        <div>
          <div className="card-title">
            <Zap size={16} color={scoreColor} /> FlowScore™
          </div>
          <div className="card-subtitle">Personal productivity indicator</div>
        </div>
        <div
          title="Weighted model: Focus Quality 30%, Goal Alignment 25%, Outcome 25%, Consistency 10%, Energy 10%"
          style={{ cursor: 'help', color: 'var(--text-tertiary)' }}
        >
          <HelpCircle size={15} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: 'auto 0' }}>
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `conic-gradient(${scoreColor} ${score * 3.6}deg, var(--bg-surface-elevated) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {score}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              / 100
            </span>
          </div>
        </div>

        {breakdown && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Focus Quality (30%)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{breakdown.focus}</span>
              </div>
              <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${breakdown.focus}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }} />
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Goal Alignment (25%)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{breakdown.goalAlignment}</span>
              </div>
              <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${breakdown.goalAlignment}%`, height: '100%', backgroundColor: 'var(--accent-info)' }} />
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Outcome Completion (25%)</span>
                <span className="mono" style={{ fontWeight: 600 }}>{breakdown.outcome}</span>
              </div>
              <div style={{ height: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${breakdown.outcome}%`, height: '100%', backgroundColor: 'var(--accent-success)' }} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '8px', marginTop: '2px' }}>
              <div>
                <div className="flex-between" style={{ fontSize: '0.7rem', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Consistency</span>
                  <span className="mono">{breakdown.consistency}</span>
                </div>
                <div style={{ height: '3px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${breakdown.consistency}%`, height: '100%', backgroundColor: 'var(--text-secondary)' }} />
                </div>
              </div>

              <div>
                <div className="flex-between" style={{ fontSize: '0.7rem', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Energy</span>
                  <span className="mono">{breakdown.energy}</span>
                </div>
                <div style={{ height: '3px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${breakdown.energy}%`, height: '100%', backgroundColor: 'var(--accent-warning)' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
