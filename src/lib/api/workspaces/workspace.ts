import {baseClient} from "../client";

export enum WorkspaceType {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export type Workspace = {
    id: string;
    name: string;
    type: WorkspaceType;
};

export type WorkspaceMember = {
    id: string;
    userId: string;
    pseudo: string;
}

export type WorkspaceDetails = {
    id: string;
    name: string;
    type: WorkspaceType;
    membersCount: number;
    channelsCount: number;
    messagesCount: number;
}

export const listWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const {data} = await baseClient.get("/api/workspaces");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getWorkspaceDetails = async (workspaceId: string): Promise<WorkspaceDetails> => {
    try {
        const {data} = await baseClient.get(`/api/workspaces/${workspaceId}/details`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const createWorkspace = async (
    name: string,
    type: WorkspaceType,
): Promise<Workspace> => {
    try {
        const {data} = await baseClient.post("/api/workspaces", {name, type});
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const updateWorkspaceIcon = async (
    workspaceId: string,
    image: File,
): Promise<Workspace> => {
    try {
        const formData = new FormData();
        formData.append("image", new Blob([image], {type: image.type}), image.name);
        const {data} = await baseClient.put(`/api/workspaces/${workspaceId}/icon`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getWorkspaceMembers = async (
    workspaceId: string,
): Promise<WorkspaceMember[]> => {
    try {
        const { data } = await baseClient.get(`/api/workspaces/${workspaceId}/members`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

interface WorkspaceTimeSeries {
    getMinutelyMessageSents(): Promise<MinutelyMessageSent[]>
}

type MinutelyMessageSent = {
    sentAt: Date,
    count: number
}

export const getWorkspaceTimeSeries = (workspaceId: string): WorkspaceTimeSeries => {
    const basePath = "/api/workspaces/" + workspaceId + "/time-series"
    return {
        async getMinutelyMessageSents(): Promise<MinutelyMessageSent[]> {
            try {
                const resp = await baseClient.get(basePath + "/messages");
                return resp.data;
            } catch(e) {
                throw e;
            }
        }
    }
}

export const getWorkspaceInviteLink = async (token: string): Promise<string> => {
    try {
        const { data } = await baseClient.get(`/api/workspace-invite-link/${token}`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const createWorkspaceInviteLink = async (workspaceId: string): Promise<string> => {
    try {
        const { data } = await baseClient.post(`/api/workspace-invite-link`, {workspaceId});
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}