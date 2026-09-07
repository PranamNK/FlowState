import React from 'react';
import type { Activity } from '../../types';
import { formatTimeSlot, formatMinutesToHours, getCategoryColor } from '../../utils/formatters';
import { Edit2, Trash2, CheckCircle, AlertCircle, RefreshCw, XCircle, Clock } from 'lucide-react';

interface TimelineProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ activities, onEdit, onDelete }) => {
  if (!activities || activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
        <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          No activities logged for this day
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          Log an activity or launch a live focus timer to populate your timeline.
        </div>
      </div>
    );
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'completed':
        return (
          <span className="badge badge-completed">
            <CheckCircle size={11} /> Completed
          </span>
        );
      case 'partially_completed':
        return (
          <span className="badge badge-neutral">
            <RefreshCw size={11} /> In Progress
          </span>
        );
      case 'interrupted':
        return (
          <span className="badge badge-attention">
            <AlertCircle size={11} /> Interrupted
          </span>
        );
      case 'abandoned':
        return (
          <span className="badge badge-danger">
            <XCircle size={11} /> Abandoned
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="timeline-track">
      {sorted.map((act) => {
        const catColor = getCategoryColor(act.category);
        const isBreak = ['break', 'rest'].includes(act.category.toLowerCase());

        return (
          <div key={act._id} className="timeline-item">
            <div
              className={`timeline-node ${isBreak ? 'break' : act.outcome === 'completed' ? 'completed' : ''}`}
              style={{ borderColor: isBreak ? 'var(--text-tertiary)' : catColor }}
            />

            <div
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    className="badge badge-category"
                    style={{ borderLeft: `3px solid ${catColor}`, backgroundColor: 'var(--bg-surface)' }}
                  >
                    {act.category}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {act.title}
                  </span>
                  {act.isPlanned && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--accent-primary)',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      Planned
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onEdit(act)}
                    title="Edit Activity"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onDelete(act._id)}
                    title="Delete Activity"
                  >
                    <Trash2 size={13} color="var(--accent-danger)" />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} color="var(--text-tertiary)" />
                  {formatTimeSlot(act.startTime)} – {formatTimeSlot(act.endTime)}
                  <span style={{ color: 'var(--text-tertiary)' }}>({formatMinutesToHours(act.durationMinutes)})</span>
                </div>

                {!isBreak && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Focus:</span>
                      <span
                        className="mono"
                        style={{
                          fontWeight: 600,
                          color: act.focusScore >= 80 ? 'var(--accent-success)' : 'var(--accent-primary)',
                        }}
                      >
                        {act.focusScore}/100
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Energy:</span>
                      <span className="mono" style={{ fontWeight: 600, color: 'var(--accent-warning)' }}>
                        {act.energyScore}/100
                      </span>
                    </div>

                    {getOutcomeBadge(act.outcome)}
                  </>
                )}
              </div>

              {act.notes && (
                <div
                  style={{
                    marginTop: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                  }}
                >
                  "{act.notes}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
