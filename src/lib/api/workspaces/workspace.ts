import type { WorkspaceRole } from "$lib/api/workspaces/roles";
import { baseClient } from "../client";

export enum WorkspaceType {
    PUBLIC = "public",
    PRIVATE = "private",
}

export type Workspace = {
    id: string;
    name: string;
    topic: string;
    type: WorkspaceType;
};

export type WorkspaceMember = {
    id: string;
    userId: string;
    pseudo: string;
    roles: WorkspaceRole[];
};

export type WorkspaceDetails = {
    id: string;
    name: string;
    topic: string;
    type: WorkspaceType;
    membersCount: number;
    channelsCount: number;
    messagesCount: number;
};

export const getWorkspace = async (workspaceId: string): Promise<Workspace> => {
    try {
        const { data } = await baseClient.get(`/api/workspaces/${workspaceId}`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export type WorkspaceDiscover = {
    id: string;
    name: string;
    ownerName: string;
    membersCount: number;
}

export const listUserWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const { data } = await baseClient.get("/api/workspaces");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const listWorkspaceDiscover = async (): Promise<WorkspaceDiscover[]> => {
    try {
        const { data } = await baseClient.get("/api/workspaces/discover");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getWorkspaceDetails = async (
    workspaceId: string,
): Promise<WorkspaceDetails> => {
    try {
        const { data } = await baseClient.get(
            `/api/workspaces/${workspaceId}/details`,
        );
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const createWorkspace = async (
    name: string,
    type: WorkspaceType,
): Promise<Workspace> => {
    try {
        const { data } = await baseClient.post("/api/workspaces", { name, type });
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
        formData.append(
            "image",
            new Blob([image], { type: image.type }),
            image.name,
        );
        const { data } = await baseClient.put(
            `/api/workspaces/${workspaceId}/icon`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const updateWorkspaceBanner = async (
    workspaceId: string,
    image: File,
): Promise<Workspace> => {
    try {
        const formData = new FormData();
        formData.append(
            "image",
            new Blob([image], { type: image.type }),
            image.name,
        );
        const { data } = await baseClient.put(
            `/api/workspaces/${workspaceId}/banner`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getWorkspaceMembers = async (
    workspaceId: string,
    page: number,
    limit: number,
): Promise<{ members: WorkspaceMember[]; total: number }> => {
    try {
        const { data } = await baseClient.get(
            `/api/workspaces/${workspaceId}/members`,
            {
                params: { page, limit },
            },
        );
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

interface WorkspaceTimeSeries {
    getMinutelyMessageSents(): Promise<MinutelyMessageSent[]>;
}

type MinutelyMessageSent = {
    sentAt: Date;
    count: number;
};

export const getWorkspaceTimeSeries = (
    workspaceId: string,
): WorkspaceTimeSeries => {
    const basePath = "/api/workspaces/" + workspaceId + "/time-series";
    return {
        async getMinutelyMessageSents(): Promise<MinutelyMessageSent[]> {
            const resp = await baseClient.get(basePath + "/messages");
            return resp.data;
        },
    };
};

export const getWorkspaceInviteLink = async (
    token: string,
): Promise<string> => {
    try {
        const { data } = await baseClient.get(
            `/api/workspace-invite-link/${token}`,
        );
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const createWorkspaceInviteLink = async (
    workspaceId: string,
): Promise<string> => {
    try {
        const { data } = await baseClient.post(`/api/workspace-invite-link/create/${workspaceId}`, {
            workspaceId,
        });
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const acceptWorkspaceInvitation = async (token: string): Promise<void> => {
    try {
        await baseClient.post(`/api/workspace-invite-link/${token}/join`);
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const updateWorkspace = async (
    workspaceId: string,
    name: string,
    topic: string,
): Promise<Workspace> => {
    try {
        const { data } = await baseClient.put(`/api/workspaces/${workspaceId}`, {
            name,
            topic,
        });
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const updateTypeWorkspace = async (
    workspaceId: string,
    type: WorkspaceType,
): Promise<Workspace> => {
    try {
        const { data } = await baseClient.put(
            `/api/workspaces/${workspaceId}/type`,
            { type },
        );
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const kickWorkspaceMember = async (
    workspaceId: string,
    userId: string,
): Promise<void> => {
    try {
        await baseClient.delete(
            `/api/workspaces/${workspaceId}/members/${userId}`,
        );
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getWorkspaceMemberId = async (
    workspaceId: string,
    userId: string,
): Promise<string> => {
    try {
        const { data } = await baseClient.get(
            `/api/workspaces/${workspaceId}/members/${userId}`,
        );
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};