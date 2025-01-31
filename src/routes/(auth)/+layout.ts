import type {LayoutLoad} from "../../../.svelte-kit/types/src/routes/$types";
import {connectToWebsocket} from "../../lib/api/ws.svelte";

export const load = (() => {
    connectToWebsocket();
}) as LayoutLoad;