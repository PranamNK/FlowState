import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Activity } from '../types';
import { Timeline } from '../components/activities/Timeline';
import { Plus } from 'lucide-react';
import { formatDateLabel } from '../utils/formatters';

interface TimelinePageProps {
  onOpenActivityModal: (activity?: Activity | null) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ onOpenActivityModal }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const loadActivities = async () => {
    try {
      const res = await api.get<{ success: boolean; activities: Activity[] }>('/activities', {
        startDate: `${selectedDate}T00:00:00.000Z`,
        endDate: `${selectedDate}T23:59:59.999Z`,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      });
      if (res.success) {
        setActivities(res.activities);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [selectedDate, selectedCategory]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this activity entry?')) {
      await api.delete(`/activities/${id}`);
      loadActivities();
    }
  };

  return (
    <div className="page-wrapper">
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '2px' }}>
            Daily Activity Log
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {formatDateLabel(selectedDate)} • Detailed execution timeline & outcomes
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="date"
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
          />

          <select
            className="select-field"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
          >
            <option value="All">All Categories</option>
            <option value="Development">Development</option>
            <option value="Study">Study</option>
            <option value="Work">Work</option>
            <option value="College">College</option>
            <option value="Exercise">Exercise</option>
            <option value="Reading">Reading</option>
            <option value="Break">Break</option>
            <option value="Social">Social</option>
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => onOpenActivityModal(null)}>
            <Plus size={14} /> Log Block
          </button>
        </div>
      </div>

      <div className="card">
        <Timeline
          activities={activities}
          onEdit={(act) => onOpenActivityModal(act)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
