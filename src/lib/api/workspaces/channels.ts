import {baseClient} from "../client";

export type Channel = {
    id: string;
    name: string;
    topic: string;
    workspaceId: string;
}

export const getWorkspaceChannels = async (workspaceId: string): Promise<Channel[]> => {
    try {
        const {data} = await baseClient.get(`/api/workspaces/${workspaceId}/channels`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const createWorkspaceChannel = async (workspaceId: string, name: string, topic: string): Promise<void> => {
    try {
        await baseClient.post(`/api/workspaces/${workspaceId}/channels`, {
            name,
            topic
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getWorkspaceChannel = async (workspaceId: string, channelId: string): Promise<Channel> => {
    try {
        const {data} = await baseClient.get(`/api/workspaces/${workspaceId}/channels/${channelId}`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export type ChannelMessage = {
    id: string;
    content: string;
    author: ChannelMessageAuthor;
    createdAt: Date;
    reactions: ChannelMessageReaction[];
}

type ChannelMessageAuthor = {
    userId: string;
    pseudo: string;
    workspaceMemberId: string;
    workspacePseudo: string;
}

type ChannelMessageReaction = {
    users: { id: string, name: string }[];
    reaction: string;
}

export const getWorkspaceChannelMessages = async (workspaceId: string, channelId: string): Promise<ChannelMessage[]> => {
    try {
        let {data} = await baseClient.get(`/api/workspaces/${workspaceId}/channels/${channelId}/messages`);
        data = data.map((message: any) => ({
            ...message,
            createdAt: new Date(message.createdAt)
        }));
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}