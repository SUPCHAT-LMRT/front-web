import { baseClient } from "$lib/api/client";

export type NotificationType = "direct_message" | "channel_message" | "workspace_invite" | "group_message";

export type DirectMessageNotificationData = {
  SenderId: string;
  MessageId: string;
};

export type ChannelMessageNotificationData = {
  SenderId: string;
  SenderAvatarUrl?: string;
  ChannelId: string;
  WorkspaceId: string;
  MessageId: string;
};

export type WorkspaceInviteNotificationData = {
  InviterId: string;
  WorkspaceId: string;
};

export type GroupMessageNotificationData = {
  SenderId: string;
  GroupId: string;
  MessageId: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  created_at: string;
  direct_message_data?: DirectMessageNotificationData;
  channel_message_data?: ChannelMessageNotificationData;
  workspace_invite_data?: WorkspaceInviteNotificationData;
  group_message_data?: GroupMessageNotificationData;
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data } = await baseClient.get<Notification[]>(`/api/notifications`);
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await baseClient.patch(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

