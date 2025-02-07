import type {PageLoad} from "./$types";
import {redirect} from "@sveltejs/kit";

export const load = (async () => {
    const currentWorkspace = localStorage.getItem("currentWorkspace");

    // Todo if no currentWorkspace, redirect to the first workspace page or a page that says "No workspaces" if the user has no workspaces

    // Redirect to the last selected chat if there is one
    if (currentWorkspace) {
        return redirect(302, `/workspaces/${currentWorkspace}`);
    }
}) as PageLoad;
