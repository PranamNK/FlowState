import React from 'react';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WeeklyTrendChartProps {
  dailyTrends?: Array<{
    day: string;
    date: string;
    totalHours: number;
    focusHours: number;
    deepWorkHours: number;
    activitiesCount: number;
  }>;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ dailyTrends = [] }) => {
  if (!dailyTrends || dailyTrends.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <Activity size={16} color="var(--accent-primary)" /> Weekly Productivity Velocity
          </div>
          <div className="card-subtitle">Daily focus hours & deep work momentum</div>
        </div>
      </div>

      <div style={{ height: '240px', width: '100%', marginTop: '12px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="deepGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} unit="h" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                color: '#0f172a',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value: any, name: any) => [
                `${value} hrs`,
                name === 'focusHours' ? 'Focus Time' : 'Deep Work (>=75 focus)',
              ]}
            />
            <Area
              type="monotone"
              dataKey="focusHours"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#focusGradient)"
            />
            <Area
              type="monotone"
              dataKey="deepWorkHours"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#deepGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '12px', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Focus Hours</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Deep Work (75+ Focus, 25m+)</span>
        </div>
      </div>
    </div>
  );
};
