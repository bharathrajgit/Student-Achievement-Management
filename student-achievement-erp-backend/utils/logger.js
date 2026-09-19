/**
 * Simple Logger Utility
 * Provides consistent logging across the application.
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

const formatLog = (level, message, data = '') => {
  return `[${getTimestamp()}] [${level}] ${message} ${data ? JSON.stringify(data) : ''}`;
};

export const logger = {
  error: (message, data) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },

  warn: (message, data) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },

  info: (message, data) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
  },

  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },
};
