import React from 'react';
import type { CategoryBreakdownItem } from '../../types';
import { getCategoryColor } from '../../utils/formatters';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface CategoryChartProps {
  categories: CategoryBreakdownItem[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <PieChartIcon size={16} color="var(--accent-primary)" /> Category Breakdown
          </div>
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          No category data available for this timeframe.
        </div>
      </div>
    );
  }

  const chartData = categories.map((c) => ({
    name: c.category,
    hours: c.hours,
    focus: c.avgFocusScore,
    color: getCategoryColor(c.category),
  }));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            <PieChartIcon size={16} color="var(--accent-primary)" /> Category Breakdown
          </div>
          <div className="card-subtitle">Time distribution & focus scores per domain</div>
        </div>
      </div>

      <div style={{ height: '220px', width: '100%', marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <XAxis type="number" unit="h" stroke="#6b7280" fontSize={11} />
            <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={80} />
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
                name === 'hours' ? `${value} hrs` : `${value}/100`,
                name === 'hours' ? 'Tracked' : 'Avg Focus',
              ]}
            />
            <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
        {categories.slice(0, 4).map((c) => (
          <div key={c.category} className="flex-between" style={{ fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getCategoryColor(c.category) }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.category}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>({c.percentage}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="mono" style={{ color: 'var(--text-secondary)' }}>{c.hours}h</span>
              <span className="mono" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{c.avgFocusScore} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
