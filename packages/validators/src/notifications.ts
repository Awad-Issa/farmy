import { z } from 'zod';

// ============================================================================
// NOTIFICATIONS VALIDATORS
// ============================================================================

/**
 * Reminder type
 */
export const reminderTypeSchema = z.enum([
  'BREEDING_INS2',
  'BREEDING_CHECK1',
  'BREEDING_CHECK2',
  'BREEDING_LAMBING_PREP',
  'BREEDING_OVERDUE',
  'HEALTH_DOSE_DUE',
  'HEALTH_DOSE_OVERDUE',
  'INVENTORY_LOW_STOCK',
  'INVENTORY_EXPIRY',
]);

export type ReminderType = z.infer<typeof reminderTypeSchema>;

/**
 * Reminder status
 */
export const reminderStatusSchema = z.enum([
  'PENDING',
  'SENT',
  'DISMISSED',
  'COMPLETED',
]);

export type ReminderStatus = z.infer<typeof reminderStatusSchema>;

/**
 * Notification type
 */
export const notificationTypeSchema = z.enum([
  'LAMBING',
  'PREGNANCY_RESULT',
  'DOSE_DUE',
  'DOSE_OVERDUE',
  'MILK_DISCARDED',
  'SALE_POSTED',
  'LOW_STOCK',
  'EXPIRY_WARNING',
  'INSIGHT_GENERATED',
]);

export type NotificationType = z.infer<typeof notificationTypeSchema>;

/**
 * Platform
 */
export const platformSchema = z.enum(['IOS', 'ANDROID', 'WEB']);

export type Platform = z.infer<typeof platformSchema>;

/**
 * List reminders input
 */
export const listRemindersInputSchema = z.object({
  farmId: z.string().uuid(),
  status: reminderStatusSchema.optional(),
  type: reminderTypeSchema.optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListRemindersInput = z.infer<typeof listRemindersInputSchema>;

/**
 * Update reminder status input
 */
export const updateReminderStatusInputSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  status: reminderStatusSchema,
});

export type UpdateReminderStatusInput = z.infer<
  typeof updateReminderStatusInputSchema
>;

/**
 * List notifications input
 */
export const listNotificationsInputSchema = z.object({
  farmId: z.string().uuid().optional(),
  read: z.boolean().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type ListNotificationsInput = z.infer<
  typeof listNotificationsInputSchema
>;

/**
 * Mark notification as read input
 */
export const markNotificationReadInputSchema = z.object({
  id: z.string().uuid(),
});

export type MarkNotificationReadInput = z.infer<
  typeof markNotificationReadInputSchema
>;

/**
 * Mark all notifications as read input
 */
export const markAllNotificationsReadInputSchema = z.object({
  farmId: z.string().uuid().optional(),
});

export type MarkAllNotificationsReadInput = z.infer<
  typeof markAllNotificationsReadInputSchema
>;

/**
 * Register device token input
 */
export const registerDeviceTokenInputSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
  platform: platformSchema,
});

export type RegisterDeviceTokenInput = z.infer<
  typeof registerDeviceTokenInputSchema
>;

/**
 * Unregister device token input
 */
export const unregisterDeviceTokenInputSchema = z.object({
  token: z.string().min(1, 'Device token is required'),
});

export type UnregisterDeviceTokenInput = z.infer<
  typeof unregisterDeviceTokenInputSchema
>;

