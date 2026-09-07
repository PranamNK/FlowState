import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { formatSecondsToTimer } from '../../utils/formatters';
import type { ActivityOutcome } from '../../types';
import { X, CheckCircle2 } from 'lucide-react';

interface FinishSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const FinishSessionModal: React.FC<FinishSessionModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  const { activeSession, elapsedSeconds, finishSession, cancelSession } = useSession();
  const [focusScore, setFocusScore] = useState(85);
  const [energyScore, setEnergyScore] = useState(80);
  const [outcome, setOutcome] = useState<ActivityOutcome>('completed');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSession) {
      setFocusScore(activeSession.focusScore || 85);
      setEnergyScore(activeSession.energyScore || 80);
      setOutcome('completed');
      setNotes('');
    }
  }, [activeSession, isOpen]);

  if (!isOpen || !activeSession) return null;

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await finishSession({
        focusScore,
        energyScore,
        outcome,
        notes: notes.trim(),
      });
      onClose();
      if (onCompleted) onCompleted();
    } catch (err: any) {
      setError(err.message || 'Failed to complete session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = async () => {
    if (window.confirm('Are you sure you want to discard this session?')) {
      await cancelSession();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--accent-success)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Finish & Log Session</h3>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFinish}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeSession.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{activeSession.category}</div>
              </div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {formatSecondsToTimer(elapsedSeconds)}
              </div>
            </div>

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
              <label className="input-label">Outcome Assessment</label>
              <select
                className="select-field"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as ActivityOutcome)}
              >
                <option value="completed">Completed — Reached planned target</option>
                <option value="partially_completed">Partially Completed — Good progress made</option>
                <option value="interrupted">Interrupted — Diverted by external demand</option>
                <option value="abandoned">Abandoned — Shifted priority</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div className="flex-between">
                  <label className="input-label">Actual Focus</label>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {focusScore}/100
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
                  <label className="input-label">Remaining Energy</label>
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', fontWeight: 600 }}>
                    {energyScore}/100
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

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Quick Notes / Key Takeaways</label>
              <textarea
                className="textarea-field"
                placeholder="What did you get done during this block?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleDiscard} disabled={isSubmitting}>
              Discard Session
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Keep Running
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Logging...' : 'Save & Log Activity'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
