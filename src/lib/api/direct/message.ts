import { baseClient } from "../client";

export type DirectMessage = {
  id: string;
  content: string;
  author: DirectMessageAuthor;
  createdAt: Date;
  reactions: DirectMessageReaction[];
};

type DirectMessageAuthor = {
  userId: string;
  firstName: string;
  lastName: string;
};

type DirectMessageReaction = {
  users: { id: string; name: string }[];
  reaction: string;
};

export const getDirectMessages = async (
  otherUserId: string,
): Promise<DirectMessage[]> => {
  try {
    let { data } = await baseClient.get(`/api/chats/direct/${otherUserId}/messages`);
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
