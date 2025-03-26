import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
  localStorage.setItem("currentWorkspace", params.workspaceId);
}) as PageLoad;
