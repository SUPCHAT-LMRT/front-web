import type {PageLoad} from "../../../../../.svelte-kit/types/src/routes";

export const load = (async ({params}) => {
    localStorage.setItem("currentWorkspace", params.workspaceId);
}) as PageLoad;
