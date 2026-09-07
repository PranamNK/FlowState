import React, { useState } from 'react';
import type { Goal, ActivityCategory } from '../../types';
import { X, Target } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: Partial<Goal>) => Promise<void>;
}

const CATEGORIES: (ActivityCategory | 'All Categories')[] = [
  'All Categories',
  'Development',
  'Study',
  'College',
  'Work',
  'Exercise',
  'Reading',
  'Planning',
];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('All Categories');
  const [targetType, setTargetType] = useState<'hours' | 'sessions' | 'focus_score'>('hours');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }
    if (targetValue <= 0) {
      setError('Target value must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        category: category === 'All Categories' ? null : category,
        targetType,
        targetValue: Number(targetValue),
        period,
      });
      onClose();
      setTitle('');
    } catch (err: any) {
      setError(err.message || 'Failed to create goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Create Productivity Target</h3>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--accent-danger-subtle)',
                  color: 'var(--accent-danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Goal Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Practice DSA 10 hours this week"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Category Scope</label>
                <select className="select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Time Horizon</label>
                <select
                  className="select-field"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                >
                  <option value="daily">Daily Target</option>
                  <option value="weekly">Weekly Target</option>
                  <option value="monthly">Monthly Target</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Target Metric</label>
                <select
                  className="select-field"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                >
                  <option value="hours">Hours Tracked</option>
                  <option value="sessions">Deep Sessions Count</option>
                  <option value="focus_score">Average Focus Score</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">
                  Target Value ({targetType === 'hours' ? 'hrs' : targetType === 'sessions' ? 'sessions' : 'pts'})
                </label>
                <input
                  type="number"
                  step={targetType === 'hours' ? '0.5' : '1'}
                  min="0.5"
                  className="input-field"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
