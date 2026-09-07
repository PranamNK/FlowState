import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { X, Zap } from 'lucide-react';
import type { ActivityCategory } from '../../types';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ActivityCategory[] = [
  'Development',
  'Study',
  'College',
  'Work',
  'Exercise',
  'Reading',
  'Planning',
  'Break',
  'Entertainment',
  'Social',
  'Other',
];

export const StartSessionModal: React.FC<StartSessionModalProps> = ({ isOpen, onClose }) => {
  const { startSession } = useSession();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Development');
  const [focusScore, setFocusScore] = useState(85);
  const [energyScore, setEnergyScore] = useState(80);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please specify what you are focusing on.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await startSession(title.trim(), category, focusScore, energyScore);
      onClose();
      setTitle('');
    } catch (err: any) {
      setError(err.message || 'Failed to start live session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Start Live Focus Session</h3>
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
              <label className="input-label">Focus Objective / Task</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Implement Baseline Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Category</label>
              <select className="select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div className="flex-between">
                  <label className="input-label">Target Focus</label>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                    {focusScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={focusScore}
                  onChange={(e) => setFocusScore(Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-primary)', width: '100%', cursor: 'pointer', marginTop: '6px' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <div className="flex-between">
                  <label className="input-label">Starting Energy</label>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-warning)' }}>
                    {energyScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={energyScore}
                  onChange={(e) => setEnergyScore(Number(e.target.value))}
                  style={{ accentColor: 'var(--accent-warning)', width: '100%', cursor: 'pointer', marginTop: '6px' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Starting...' : '⚡ Launch Timer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
