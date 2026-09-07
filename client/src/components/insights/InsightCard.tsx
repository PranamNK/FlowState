import React from 'react';
import type { Insight } from '../../types';
import { TrendingUp, AlertTriangle, Lightbulb, Bot } from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'positive':
        return {
          icon: <TrendingUp size={16} color="var(--accent-success)" />,
          badgeClass: 'badge-positive',
          borderColor: 'var(--accent-success-border)',
        };
      case 'attention':
        return {
          icon: <AlertTriangle size={16} color="var(--accent-warning)" />,
          badgeClass: 'badge-attention',
          borderColor: 'var(--accent-warning-border)',
        };
      default:
        return {
          icon: <Lightbulb size={16} color="var(--accent-info)" />,
          badgeClass: 'badge-neutral',
          borderColor: 'var(--border-subtle)',
        };
    }
  };

  const style = getSeverityStyle(insight.severity);

  return (
    <div
      className="card"
      style={{
        padding: '16px 18px',
        borderLeft: `3px solid ${insight.severity === 'positive' ? 'var(--accent-success)' : insight.severity === 'attention' ? 'var(--accent-warning)' : 'var(--accent-primary)'}`,
      }}
    >
      <div className="flex-between" style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {style.icon}
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {insight.title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {insight.generatedBy === 'gemini' ? (
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary-glow)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Bot size={11} /> Groq AI
            </span>
          ) : (
            <span className="badge badge-neutral">Rules Engine</span>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
        {insight.description}
      </p>
    </div>
  );
};
