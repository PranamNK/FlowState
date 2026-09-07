import React from 'react';
import { Flame } from 'lucide-react';

interface FocusHeatmapProps {
  hourlyDistribution: Array<{
    hour: number;
    hourLabel: string;
    trackedMinutes: number;
    averageFocus: number;
  }>;
  bestFocusWindow: string;
  lowestFocusWindow?: string;
}

export const FocusHeatmap: React.FC<FocusHeatmapProps> = ({
  hourlyDistribution = [],
  bestFocusWindow,
}) => {
  const maxMinutes = Math.max(1, ...hourlyDistribution.map((h) => h.trackedMinutes));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Flame size={16} color="var(--accent-primary)" /> 24-Hour Focus Distribution
          </div>
          <div className="card-subtitle">Hourly focus density and optimal productivity windows</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {bestFocusWindow !== 'N/A' && (
            <span className="badge badge-positive">
              <Flame size={12} /> Peak: {bestFocusWindow}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(24, 1fr)',
          gap: '3px',
          alignItems: 'flex-end',
          height: '110px',
          paddingTop: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {hourlyDistribution.map((h) => {
          const heightPct = Math.max(4, Math.round((h.trackedMinutes / maxMinutes) * 100));
          const focus = h.averageFocus || 0;
          let barColor = 'var(--bg-surface-elevated)';

          if (h.trackedMinutes > 0) {
            if (focus >= 80) barColor = 'var(--accent-success)';
            else if (focus >= 60) barColor = 'var(--accent-primary)';
            else barColor = 'var(--accent-warning)';
          }

          return (
            <div
              key={h.hour}
              title={`${h.hourLabel} — ${h.trackedMinutes}m tracked, ${h.averageFocus}/100 avg focus`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  backgroundColor: barColor,
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.2s ease',
                  cursor: 'pointer',
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          fontSize: '0.65rem',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
};
