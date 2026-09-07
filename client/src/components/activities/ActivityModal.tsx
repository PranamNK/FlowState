import React, { useState, useEffect } from 'react';
import type { Activity, ActivityCategory, ActivityOutcome } from '../../types';
import { X, Clock } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activityData: Partial<Activity>) => Promise<void>;
  initialActivity?: Activity | null;
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

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialActivity,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Development');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:30');
  const [focusScore, setFocusScore] = useState(80);
  const [energyScore, setEnergyScore] = useState(80);
  const [outcome, setOutcome] = useState<ActivityOutcome>('completed');
  const [notes, setNotes] = useState('');
  
  const [isPlanned, setIsPlanned] = useState(false);
  const [plannedStartTimeStr, setPlannedStartTimeStr] = useState('09:00');
  const [plannedEndTimeStr, setPlannedEndTimeStr] = useState('10:00');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialActivity) {
      setTitle(initialActivity.title);
      setCategory(initialActivity.category);
      const start = new Date(initialActivity.startTime);
      const end = new Date(initialActivity.endTime);
      setDate(start.toISOString().split('T')[0]);
      setStartTimeStr(start.toTimeString().slice(0, 5));
      setEndTimeStr(end.toTimeString().slice(0, 5));
      setFocusScore(initialActivity.focusScore || 70);
      setEnergyScore(initialActivity.energyScore || 70);
      setOutcome(initialActivity.outcome || 'completed');
      setNotes(initialActivity.notes || '');
      setIsPlanned(Boolean(initialActivity.isPlanned));
      if (initialActivity.plannedStartTime) {
        setPlannedStartTimeStr(new Date(initialActivity.plannedStartTime).toTimeString().slice(0, 5));
      }
      if (initialActivity.plannedEndTime) {
        setPlannedEndTimeStr(new Date(initialActivity.plannedEndTime).toTimeString().slice(0, 5));
      }
    } else {
      setTitle('');
      setCategory('Development');
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      const past = new Date(now.getTime() - 60 * 60000);
      setStartTimeStr(past.toTimeString().slice(0, 5));
      setEndTimeStr(now.toTimeString().slice(0, 5));
      setFocusScore(80);
      setEnergyScore(80);
      setOutcome('completed');
      setNotes('');
      setIsPlanned(false);
      setPlannedStartTimeStr(past.toTimeString().slice(0, 5));
      setPlannedEndTimeStr(now.toTimeString().slice(0, 5));
    }
    setError(null);
  }, [initialActivity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide an activity title.');
      return;
    }

    const start = new Date(`${date}T${startTimeStr}:00`);
    const end = new Date(`${date}T${endTimeStr}:00`);

    if (end <= start) {
      setError('End time must be strictly after start time.');
      return;
    }

    let plannedStart: Date | null = null;
    let plannedEnd: Date | null = null;
    let plannedDurMins: number | null = null;

    if (isPlanned) {
      plannedStart = new Date(`${date}T${plannedStartTimeStr}:00`);
      plannedEnd = new Date(`${date}T${plannedEndTimeStr}:00`);
      plannedDurMins = Math.max(1, Math.round((plannedEnd.getTime() - plannedStart.getTime()) / 60000));
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMinutes: Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)),
        focusScore,
        energyScore,
        outcome,
        notes: notes.trim(),
        isPlanned,
        plannedStartTime: plannedStart ? plannedStart.toISOString() : null,
        plannedEndTime: plannedEnd ? plannedEnd.toISOString() : null,
        plannedDurationMinutes: plannedDurMins,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save activity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
              {initialActivity ? 'Edit Activity' : 'Record Activity'}
            </h3>
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
                  padding: '10px 14px',
                  backgroundColor: 'var(--accent-danger-subtle)',
                  border: '1px solid var(--accent-danger-border)',
                  color: 'var(--accent-danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Title / Task Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Implement Auth Service"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Category</label>
                <select
                  className="select-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Start Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">End Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Planned Activity Comparison</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Record what you originally intended to do for schedule variance analysis
                </div>
              </div>
              <input
                type="checkbox"
                checked={isPlanned}
                onChange={(e) => setIsPlanned(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            {isPlanned && (
              <div className="grid-2" style={{ padding: '10px 12px', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--accent-primary)' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Planned Start</label>
                  <input
                    type="time"
                    className="input-field"
                    value={plannedStartTimeStr}
                    onChange={(e) => setPlannedStartTimeStr(e.target.value)}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Planned End</label>
                  <input
                    type="time"
                    className="input-field"
                    value={plannedEndTimeStr}
                    onChange={(e) => setPlannedEndTimeStr(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <div className="flex-between">
                  <label className="input-label">Focus Quality</label>
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
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer', width: '100%', marginTop: '6px' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <div className="flex-between">
                  <label className="input-label">Energy Level</label>
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
                  style={{ accentColor: 'var(--accent-warning)', cursor: 'pointer', width: '100%', marginTop: '6px' }}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Activity Outcome</label>
              <select
                className="select-field"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as ActivityOutcome)}
              >
                <option value="completed">Completed — Goal fully reached</option>
                <option value="partially_completed">Partially Completed — Made steady progress</option>
                <option value="interrupted">Interrupted — External distraction / shift</option>
                <option value="abandoned">Abandoned — Dropped or postponed</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Notes & Observations (Optional)</label>
              <textarea
                className="textarea-field"
                placeholder="What went well? Any obstacles or takeaways?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialActivity ? 'Save Changes' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
