/**
 * Password strength validation
 * Minimum 8 characters, mix of letters and numbers recommended
 */
export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: true,
      message: 'Password should contain both letters and numbers for better security',
    };
  }

  return { valid: true };
};

/**
 * Calculate password strength (0-100)
 */
export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 20;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

  return Math.min(strength, 100);
};

/**
 * Validate RFID format (15 digits)
 */
export const isValidRFID = (rfid: string): boolean => {
  return /^\d{15}$/.test(rfid);
};

/**
 * Validate tag number format (alphanumeric)
 */
export const isValidTagNumber = (tag: string): boolean => {
  return /^[A-Za-z0-9\-]+$/.test(tag) && tag.length > 0 && tag.length <= 20;
};

