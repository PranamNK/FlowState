export function formatSecondsToTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatMinutesToHours(minutes: number): string {
  if (!minutes || isNaN(minutes) || minutes === 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function formatTimeSlot(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateLabel(dateInput: string | Date): string {
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const CATEGORY_COLORS: Record<string, string> = {
  Development: '#6366f1', // Indigo
  Study: '#3b82f6',       // Blue
  College: '#0ea5e9',     // Sky
  Work: '#8b5cf6',        // Purple
  Exercise: '#10b981',    // Emerald
  Reading: '#14b8a6',     // Teal
  Planning: '#f59e0b',    // Amber
  Break: '#6b7280',       // Gray
  Entertainment: '#ec4899',// Pink
  Social: '#f97316',      // Orange
  Other: '#94a3b8',       // Slate
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#94a3b8';
}
