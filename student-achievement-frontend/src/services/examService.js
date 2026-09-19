// src/services/examService.js

// Common exam utilities & helpers

/**
 * Download file from blob data
 */
export const downloadFile = (data, fileName) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    Registered: '#3b82f6',
    Submitted: '#f59e0b',
    Passed: '#10b981',
    Failed: '#ef4444',
    Pending: '#8b5cf6',
    Approved: '#10b981',
    Rejected: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

/**
 * Get status background color
 */
export const getStatusBgColor = (status) => {
  const colors = {
    Registered: '#dbeafe',
    Submitted: '#fef3c7',
    Passed: '#dcfce7',
    Failed: '#fee2e2',
    Pending: '#f3e8ff',
    Approved: '#dcfce7',
    Rejected: '#fee2e2',
  };
  return colors[status] || '#f3f4f6';
};

/**
 * Calculate pass rate percentage
 */
export const calculatePassRate = (passed, failed) => {
  if (passed + failed === 0) return 0;
  return Math.round((passed / (passed + failed)) * 100);
};

/**
 * Calculate completion rate percentage
 */
export const calculateCompletionRate = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Calculate days overdue
 */
export const calculateDaysOverdue = (expectedDate) => {
  if (!expectedDate) return 0;
  const now = new Date();
  const expected = new Date(expectedDate);
  const diff = now - expected;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

/**
 * Validate certificate link
 */
export const isValidCertificateLink = (link) => {
  if (!link) return false;
  try {
    const url = new URL(link);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Get platform icon/emoji
 */
export const getPlatformIcon = (platform) => {
  const icons = {
    NPTEL: '📚',
    Coursera: '🎓',
    Udemy: '💻',
    LinkedIn: '👔',
    AWS: '☁️',
    Google: '🔍',
    Microsoft: '🪟',
  };
  return icons[platform] || '📖';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get enrollment warning level
 */
export const getEnrollmentWarning = (count) => {
  if (count < 5) return { level: 'critical', color: '#ef4444', bg: '#fee2e2' };
  if (count < 10) return { level: 'low', color: '#f59e0b', bg: '#fef3c7' };
  return { level: 'good', color: '#10b981', bg: '#dcfce7' };
};

/**
 * Sort array by key
 */
export const sortByKey = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Group array by key
 */
export const groupByKey = (array, key) => {
  return array.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};
