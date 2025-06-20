import { baseClient } from "$lib/api/client";

export enum RecentChatKind {
  GROUP = "GROUP",
  DIRECT = "DIRECT",
}

export type RecentChat = {
  id: string;
  kind: RecentChatKind;
  avatarUrl: string;
  name: string;
  lastMessage: {
    id: string;
    content: string;
    createdAt: Date;
    authorId: string;
    authorName: string;
  }
};

export const getRecentChats = async (): Promise<RecentChat[]> => {
  try {
    let { data } = await baseClient.get("/api/chats/recents");
    data = data.map((chat: any) => {
      if (chat.kind === 0) {
        chat.kind = RecentChatKind.GROUP;
      } else if (chat.kind === 1) {
        chat.kind = RecentChatKind.DIRECT;
      }
      return chat;
    });
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
