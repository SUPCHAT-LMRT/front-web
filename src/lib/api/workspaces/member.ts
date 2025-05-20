import { baseClient } from "../client";

export const joinWorkspace = async (workspaceId: string): Promise<void> => {
	await baseClient.get(`/api/workspaces/discover/${workspaceId}/join`);
}