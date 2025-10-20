/**
 * Normalize phone number to international format
 * Example: 0591234567 -> +970591234567
 */
export const normalizePhone = (phone: string): string => {
  // Remove spaces, dashes, parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, '');

  // If starts with 0, replace with +970 (Palestine)
  if (normalized.startsWith('0')) {
    normalized = '+970' + normalized.slice(1);
  }

  // If doesn't start with +, add +970
  if (!normalized.startsWith('+')) {
    normalized = '+970' + normalized;
  }

  return normalized;
};

/**
 * Validate Palestinian phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  // Palestinian numbers: +970 followed by 9 digits (starting with 5 or 2)
  return /^\+970[52]\d{8}$/.test(normalized);
};

/**
 * Format phone for display
 * +970591234567 -> 059-123-4567
 */
export const formatPhoneDisplay = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith('+970')) {
    const number = normalized.slice(4); // Remove +970
    return `0${number.slice(0, 2)}-${number.slice(2, 5)}-${number.slice(5)}`;
  }
  return phone;
};

