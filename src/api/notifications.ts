import { api } from "./http";

export interface NotificationItem {
  id: string;
  type: string;
  level: "success" | "warning" | "error" | "info";
  title: string;
  content?: string;
  relatedType?: string;
  relatedId?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  unreadCount?: number;
}

export interface NotificationsPageResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

// 获取最近通知（仪表盘）
export const getRecent = (limit: number = 5) =>
  api.get<{ items: NotificationItem[] }>("/notifications/recent", {
    params: { limit },
  });

// 获取未读通知（右上角下拉）
export const getUnread = (limit: number = 5) =>
  api.get<NotificationsResponse>("/notifications", {
    params: { status: "unread", limit },
  });

// 标记已读
export const markRead = (id: string) =>
  api.put<void>(`/notifications/${id}/read`);

// 全部已读
export const markAllRead = () =>
  api.put<void>("/notifications/read-all");

// 兼容旧命名（保留原有导出）
export const getRecentNotifications = getRecent;
export const getUnreadNotifications = getUnread;
export const markNotificationRead = markRead;
export const markAllNotificationsRead = markAllRead;
