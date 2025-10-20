/**
 * Notifications router - Reminders and notifications
 */

// import { TRPCError } from '@trpc/server';
import { router, farmProcedure, protectedProcedure } from '../trpc';
import {
  listRemindersInputSchema,
  updateReminderStatusInputSchema,
  listNotificationsInputSchema,
  markNotificationReadInputSchema,
  markAllNotificationsReadInputSchema,
  registerDeviceTokenInputSchema,
  unregisterDeviceTokenInputSchema,
} from '@farmy/validators';

export const notificationsRouter = router({
  reminders: router({
    /**
     * List reminders
     */
    list: farmProcedure
      .input(listRemindersInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { farmId: input.farmId };

        if (input.status) {
          where.status = input.status;
        }
        if (input.type) {
          where.type = input.type;
        }

        const reminders = await ctx.prisma.reminder.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { dueDate: 'asc' },
        });

        let nextCursor: string | undefined = undefined;
        if (reminders.length > input.limit) {
          const nextItem = reminders.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: reminders,
          nextCursor,
        };
      }),

    /**
     * Update reminder status
     */
    updateStatus: farmProcedure
      .input(updateReminderStatusInputSchema)
      .mutation(async ({ ctx, input }) => {
        const reminder = await ctx.prisma.reminder.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        return reminder;
      }),
  }),

  inbox: router({
    /**
     * List notifications
     */
    list: protectedProcedure
      .input(listNotificationsInputSchema)
      .query(async ({ ctx, input }) => {
        const where: any = { userId: ctx.user.userId };

        if (input.farmId) {
          where.farmId = input.farmId;
        }
        if (input.read !== undefined) {
          where.read = input.read;
        }

        const notifications = await ctx.prisma.notificationInbox.findMany({
          where,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { createdAt: 'desc' },
        });

        let nextCursor: string | undefined = undefined;
        if (notifications.length > input.limit) {
          const nextItem = notifications.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: notifications,
          nextCursor,
        };
      }),

    /**
     * Mark notification as read
     */
    markRead: protectedProcedure
      .input(markNotificationReadInputSchema)
      .mutation(async ({ ctx, input }) => {
        const notification = await ctx.prisma.notificationInbox.update({
          where: { id: input.id },
          data: { read: true },
        });

        return notification;
      }),

    /**
     * Mark all notifications as read
     */
    markAllRead: protectedProcedure
      .input(markAllNotificationsReadInputSchema)
      .mutation(async ({ ctx, input }) => {
        const where: any = {
          userId: ctx.user.userId,
          read: false,
        };

        if (input.farmId) {
          where.farmId = input.farmId;
        }

        const result = await ctx.prisma.notificationInbox.updateMany({
          where,
          data: { read: true },
        });

        return { count: result.count };
      }),
  }),

  devices: router({
    /**
     * Register device token for push notifications
     */
    register: protectedProcedure
      .input(registerDeviceTokenInputSchema)
      .mutation(async ({ ctx, input }) => {
        // Upsert device token
        const token = await ctx.prisma.deviceToken.upsert({
          where: { token: input.token },
          update: {
            lastUsed: new Date(),
            platform: input.platform,
          },
          create: {
            userId: ctx.user.userId,
            token: input.token,
            platform: input.platform,
          },
        });

        return token;
      }),

    /**
     * Unregister device token
     */
    unregister: protectedProcedure
      .input(unregisterDeviceTokenInputSchema)
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.deviceToken.deleteMany({
          where: {
            token: input.token,
            userId: ctx.user.userId,
          },
        });

        return { success: true };
      }),
  }),
});

