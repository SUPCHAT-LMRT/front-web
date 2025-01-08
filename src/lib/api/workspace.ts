import { baseClient } from "$lib/api/client";

export type Workspace = {
    id: string;
    name: string;
    type: 'PUBLIC' | 'PRIVATE';
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const { data } = await baseClient.get("/api/workspaces");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const createWorkspace = async (
    name: string,
    type: 'PUBLIC' | 'PRIVATE',
): Promise<Workspace> => {
    try {
        const { data } = await baseClient.post("api/workspaces", { name, type });
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};