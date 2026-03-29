import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function formatDuration(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function getStatusColor(status) {
  const colors = {
    active: { bg: 'bg-success-500', text: 'text-success-500', dot: '#10B981' },
    down: { bg: 'bg-danger-500', text: 'text-danger-500', dot: '#EF4444' },
    warning: { bg: 'bg-warning-500', text: 'text-warning-500', dot: '#F59E0B' },
    maintenance: { bg: 'bg-purple-500', text: 'text-purple-500', dot: '#8B5CF6' },
    disconnected: { bg: 'bg-gray-500', text: 'text-gray-500', dot: '#6B7280' },
  };
  return colors[status] || colors.active;
}

export function getSeverityColor(severity) {
  const colors = {
    low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
    medium: { bg: 'bg-warning-500/10', text: 'text-warning-600 dark:text-warning-400', border: 'border-warning-300 dark:border-warning-700' },
    critical: { bg: 'bg-danger-500/10', text: 'text-danger-600 dark:text-danger-400', border: 'border-danger-300 dark:border-danger-700' },
  };
  return colors[severity] || colors.low;
}
