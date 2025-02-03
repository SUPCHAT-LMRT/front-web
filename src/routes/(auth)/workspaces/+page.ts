import type {PageLoad} from "./$types";
import {redirect} from "@sveltejs/kit";

export const load = (async () => {
    const currentWorkspace = localStorage.getItem("currentWorkspace");

    // Redirect to the last selected chat if there is one
    if (currentWorkspace) {
        return redirect(302, `/workspaces/${currentWorkspace}`);
    }
}) as PageLoad;
