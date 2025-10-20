import { format, parseISO, addDays, differenceInDays } from 'date-fns';

/**
 * Format a date to ISO string
 */
export const toISODate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
};

/**
 * Format date for display (localized)
 */
export const formatDisplayDate = (
  date: Date | string,
  formatStr = 'yyyy-MM-dd'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

