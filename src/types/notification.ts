export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationFilter {
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}