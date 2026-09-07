import React from 'react';
import type { Goal } from '../../types';
import { Target, CheckCircle2, Trash2 } from 'lucide-react';
import { getCategoryColor } from '../../utils/formatters';

interface GoalCardProps {
  goal: Goal;
  onDelete?: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onDelete }) => {
  const isAchieved = (goal.progressPct || 0) >= 100 || goal.status === 'achieved';
  const catColor = goal.category ? getCategoryColor(goal.category) : 'var(--accent-primary)';

  return (
    <div
      className="card"
      style={{
        padding: '16px 18px',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: `1px solid ${isAchieved ? 'var(--accent-success-border)' : 'var(--border-subtle)'}`,
      }}
    >
      <div className="flex-between" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: isAchieved ? 'var(--accent-success-subtle)' : 'rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isAchieved ? (
              <CheckCircle2 size={15} color="var(--accent-success)" />
            ) : (
              <Target size={15} color="var(--accent-primary)" />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {goal.title}
            </div>
            {goal.category && (
              <span style={{ fontSize: '0.7rem', color: catColor, fontWeight: 500 }}>
                {goal.category}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
            {goal.period}
          </span>
          {onDelete && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onDelete(goal._id)}
              title="Remove Target"
            >
              <Trash2 size={13} color="var(--accent-danger)" />
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Progress</span>
          <span className="mono" style={{ fontWeight: 600, color: isAchieved ? 'var(--accent-success)' : 'var(--text-primary)' }}>
            {goal.currentValue || 0} / {goal.targetValue} {goal.unit || 'hrs'} ({goal.progressPct || 0}%)
          </span>
        </div>
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, goal.progressPct || 0)}%`,
              height: '100%',
              backgroundColor: isAchieved ? 'var(--accent-success)' : 'var(--accent-primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
};
