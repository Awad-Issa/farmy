/**
 * Format currency for display
 * Default: Israeli Shekel (ILS/NIS)
 */
export const formatCurrency = (
  amount: number,
  currency: 'ILS' | 'USD' = 'ILS',
  locale = 'he-IL'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Round to specified decimal places
 */
export const roundTo = (value: number, decimals = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

