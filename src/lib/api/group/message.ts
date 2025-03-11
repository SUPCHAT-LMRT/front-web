import { baseClient } from "../client";

export type GroupMessage = {
  id: string;
  content: string;
  author: GroupMessageAuthor;
  createdAt: Date;
};

type GroupMessageAuthor = {
  userId: string;
  pseudo: string;
};

export const getGroupMessages = async (
  groupId: string,
): Promise<GroupMessage[]> => {
  try {
    let { data } = await baseClient.get(`/api/groups/${groupId}/messages`);
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
