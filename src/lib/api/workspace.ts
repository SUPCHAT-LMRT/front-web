import { baseClient } from "$lib/api/client";

export type Workspace = {
    id: string;
    name: string;
    type: string;
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
    type: string,
): Promise<Workspace> => {
    try {
        const { data } = await baseClient.post("/api/workspaces", { name, type, userId: "678fb1dc90530577bfa9256f" });
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};