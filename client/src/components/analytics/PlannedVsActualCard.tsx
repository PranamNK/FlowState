import React from 'react';
import type { PlannedVsActualComparison } from '../../types';
import { formatTimeSlot, formatMinutesToHours, getCategoryColor } from '../../utils/formatters';
import { CheckCircle2, Clock } from 'lucide-react';

interface PlannedVsActualCardProps {
  hasPlannedData: boolean;
  completionRate: number;
  averageStartDelayMinutes: number;
  totalOverrunMinutes?: number;
  comparisons: PlannedVsActualComparison[];
  observation: string;
}

export const PlannedVsActualCard: React.FC<PlannedVsActualCardProps> = ({
  hasPlannedData,
  completionRate,
  averageStartDelayMinutes,
  comparisons,
  observation,
}) => {
  if (!hasPlannedData) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Clock size={16} color="var(--accent-primary)" /> Planned vs. Actual Analysis
          </div>
        </div>
        <div style={{ padding: '16px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          No planned activities scheduled for this day. Check "Planned Activity" when logging tasks to view schedule adherence analysis.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Clock size={16} color="var(--accent-primary)" /> Planned vs. Actual Execution
          </div>
          <div className="card-subtitle">Schedule adherence, start delays, and overrun tracking</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-positive">
            <CheckCircle2 size={12} /> {completionRate}% Plan Met
          </span>
          {averageStartDelayMinutes > 0 && (
            <span className="badge badge-attention">
              +{averageStartDelayMinutes}m Avg Delay
            </span>
          )}
        </div>
      </div>

      {/* Objective observation banner */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--accent-primary)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
        }}
      >
        {observation}
      </div>

      {/* Comparisons table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', fontWeight: 500 }}>Task</th>
              <th style={{ padding: '8px 10px', fontWeight: 500 }}>Planned Window</th>
              <th style={{ padding: '8px 10px', fontWeight: 500 }}>Actual Window</th>
              <th style={{ padding: '8px 10px', fontWeight: 500 }}>Duration Variance</th>
              <th style={{ padding: '8px 10px', fontWeight: 500 }}>Start Delay</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c, i) => {
              const catColor = getCategoryColor(c.category);
              const varianceStr =
                c.durationVarianceMinutes > 0
                  ? `+${c.durationVarianceMinutes}m (Overrun)`
                  : c.durationVarianceMinutes < 0
                  ? `${c.durationVarianceMinutes}m (Shorter)`
                  : 'On time';

              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: catColor }} />
                      {c.title}
                    </div>
                  </td>
                  <td className="mono" style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                    {formatTimeSlot(c.plannedStartTime)} ({formatMinutesToHours(c.plannedDurationMinutes)})
                  </td>
                  <td className="mono" style={{ padding: '10px', color: 'var(--text-secondary)' }}>
                    {formatTimeSlot(c.actualStartTime)} ({formatMinutesToHours(c.actualDurationMinutes)})
                  </td>
                  <td
                    className="mono"
                    style={{
                      padding: '10px',
                      color: c.isOverrun ? 'var(--accent-warning)' : 'var(--text-secondary)',
                      fontWeight: c.isOverrun ? 600 : 400,
                    }}
                  >
                    {varianceStr}
                  </td>
                  <td
                    className="mono"
                    style={{
                      padding: '10px',
                      color: c.isDelayed ? 'var(--accent-warning)' : 'var(--accent-success)',
                    }}
                  >
                    {c.startDelayMinutes > 0 ? `+${c.startDelayMinutes}m` : 'Prompt'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
