import type {LayoutLoad} from "./$types";
import recentChatsStore from "$lib/stores/recentChatsStore";

export const load = (async () => {
    return await recentChatsStore.fetch();
}) as LayoutLoad;
