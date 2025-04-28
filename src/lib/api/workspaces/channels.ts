import { baseClient } from "../client";

export type Channel = {
  id: string;
  name: string;
  topic: string;
  workspaceId: string;
  order: number;
};

export const getWorkspaceChannels = async (
  workspaceId: string,
): Promise<Channel[]> => {
  try {
    const { data } = await baseClient.get(
      `/api/workspaces/${workspaceId}/channels`,
    );
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const createWorkspaceChannel = async (
  workspaceId: string,
  name: string,
  topic: string,
): Promise<void> => {
  try {
    await baseClient.post(`/api/workspaces/${workspaceId}/channels`, {
      name,
      topic,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getWorkspaceChannel = async (
  workspaceId: string,
  channelId: string,
): Promise<Channel> => {
  try {
    const { data } = await baseClient.get(
      `/api/workspaces/${workspaceId}/channels/${channelId}`,
    );
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export type ChannelMessage = {
  id: string;
  content: string;
  author: ChannelMessageAuthor;
  createdAt: Date;
  reactions: ChannelMessageReaction[];
};

type ChannelMessageAuthor = {
  userId: string;
  pseudo: string;
  workspaceMemberId: string;
  workspacePseudo: string;
};

type ChannelMessageReaction = {
  users: { id: string; name: string }[];
  reaction: string;
};

export const getWorkspaceChannelMessages = async (
  workspaceId: string,
  channelId: string,
  params: {
    limit?: number;
    before?: Date;
    after?: Date;
    aroundMessageId?: string;
  } = {},
): Promise<ChannelMessage[]> => {
  try {
    let { data } = await baseClient.get(
      `/api/workspaces/${workspaceId}/channels/${channelId}/messages?limit=${params.limit}${params.before ? `&before=${params.before.toISOString()}` : ""}${params.after ? `&after=${params.after.toISOString()}` : ""}${params.aroundMessageId ? `&aroundMessageId=${params.aroundMessageId}` : ""}`,
    );
    data = data.map((message: Record<string, never>) => ({
      ...message,
      createdAt: new Date(message.createdAt),
    }));
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const reorderWorkspaceChannel = async (
    workspaceId: string,
    channels: { id: string; newIndex: number }[],
    ): Promise<void> => {
    try {
        await baseClient.post(
        `/api/workspaces/${workspaceId}/channels/reorder`, channels,
        );
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const deleteWorkspaceChannel = async (
  workspaceId: string,
  channelId: string,
): Promise<void> => {
  try {
    await baseClient.delete(
      `/api/workspaces/${workspaceId}/channels/${channelId}`,
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};