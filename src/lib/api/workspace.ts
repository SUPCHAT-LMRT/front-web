import {baseClient} from "$lib/api/client";

export enum WorkspaceType {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export type Workspace = {
    id: string;
    name: string;
    type: WorkspaceType;
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const {data} = await baseClient.get("/api/workspaces");
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