import { baseClient } from "$lib/api/client";

export type WorkspaceType = "PRIVATE" | "PUBLIC";

export type Workspace = {
    id: string;
    name: string;
    type: WorkspaceType;
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
        type: WorkspaceType,
): Promise<Workspace> => {
    try {
        const { data } = await baseClient.post("/api/workspaces", { name, type, userId: "6797f984eaeb71f709074293" });
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};