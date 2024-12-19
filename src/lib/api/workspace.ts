import {baseClient} from "$lib/api/client";

export type Workspace = {
    id: string;
    name: string;
    type: 'PUBLIC' | 'PRIVATE'
}

export const getWorkspaces = async (): Promise<Workspace[]> => {
    try {
        const {data} = await baseClient.get("/workspaces");
        return data;
    }catch (e) {
        console.error(e);
        throw e;
    }
}