import { baseClient } from "$lib/api/client";

export type Workspace = {
    id: string;
    name: string;
    type: 'PUBLIC' | 'PRIVATE';
    members?: string[];
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const { data } = await baseClient.get("/workspaces");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const createWorkspace = async (
    name: string,
    type: 'PUBLIC' | 'PRIVATE',
    members: string[] = []
): Promise<Workspace> => {
    try {
        const { data } = await baseClient.post("/workspaces", { name, type, members });
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};