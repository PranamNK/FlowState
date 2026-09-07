import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Goal } from '../types';
import { GoalCard } from '../components/goals/GoalCard';
import { Target, Plus, CheckCircle2, TrendingUp } from 'lucide-react';

interface GoalsPageProps {
  onOpenGoalModal: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onOpenGoalModal }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = async () => {
    try {
      const res = await api.get<{ success: boolean; goals: Goal[] }>('/goals');
      if (res.success) {
        setGoals(res.goals);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Delete this goal target?')) {
      await api.delete(`/goals/${id}`);
      loadGoals();
    }
  };

  const activeGoals = goals.filter((g) => (g.progressPct || 0) < 100 && g.status !== 'achieved');
  const achievedGoals = goals.filter((g) => (g.progressPct || 0) >= 100 || g.status === 'achieved');

  return (
    <div className="page-wrapper">
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2px' }}>
            Productivity Targets & Horizons
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track your quantitative milestones across daily, weekly, and monthly rhythms
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={onOpenGoalModal}>
          <Plus size={14} /> Create Target
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Active Targets</span>
            <Target size={16} color="var(--accent-primary)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {activeGoals.length}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Achieved Targets</span>
            <CheckCircle2 size={16} color="var(--accent-success)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-success)' }}>
            {achievedGoals.length}
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Success Rate</span>
            <TrendingUp size={16} color="var(--accent-info)" />
          </div>
          <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-info)' }}>
            {goals.length > 0 ? `${Math.round((achievedGoals.length / goals.length) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '14px' }}>
          In-Progress Targets ({activeGoals.length})
        </h2>

        {activeGoals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-tertiary)' }}>
            No active targets right now.{' '}
            <span
              style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
              onClick={onOpenGoalModal}
            >
              Add a new target
            </span>{' '}
            to align your focus blocks.
          </div>
        ) : (
          <div className="grid-2" style={{ gap: '16px' }}>
            {activeGoals.map((g) => (
              <GoalCard key={g._id} goal={g} onDelete={handleDeleteGoal} />
            ))}
          </div>
        )}
      </div>

      {achievedGoals.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '14px' }}>
            Achieved Targets ({achievedGoals.length})
          </h2>
          <div className="grid-2" style={{ gap: '16px' }}>
            {achievedGoals.map((g) => (
              <GoalCard key={g._id} goal={g} onDelete={handleDeleteGoal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
