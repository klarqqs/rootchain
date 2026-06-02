import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { publishEvent } from "../lib/event-bus.js";
import { sendEmailNotification } from "./email.service.js";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Prisma.InputJsonValue;
  email?: { to: string; subject?: string };
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata,
    },
  });

  await publishEvent({
    type: "notification",
    payload: {
      id: notification.id,
      userId: input.userId,
      notificationType: input.type,
      title: input.title,
      body: input.body,
    },
    timestamp: new Date().toISOString(),
  });

  if (input.email) {
    await sendEmailNotification({
      to: input.email.to,
      subject: input.email.subject ?? input.title,
      body: input.body,
    });
  }

  return notification;
}

export async function listNotifications(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markNotificationRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
