import '../app.css';
import {createWorkspaceFormSchema} from "$lib/components/app-sidebar/schema";
import {superValidate} from "sveltekit-superforms";
import {zod} from "sveltekit-superforms/adapters";
import type {LayoutLoad} from "../../.svelte-kit/types/src/routes/$types";

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

export const load = (async () => {
    return {
        createWorkspaceForm: await superValidate(zod(createWorkspaceFormSchema))
    };
})satisfies LayoutLoad;