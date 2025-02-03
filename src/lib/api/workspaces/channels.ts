import {baseClient} from "../client";

export type Channel = {
    id: string;
    name: string;
    topic: string;
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