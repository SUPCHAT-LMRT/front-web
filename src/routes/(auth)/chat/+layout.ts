import type {LayoutLoad} from "./$types";
import recentChatsStore from "$lib/stores/recentChatsStore";

let fetched = false;

export const load = (async ({route}) => {
    if (!fetched || route.id === "/(auth)/chat") {
        fetched = true;
        return await recentChatsStore.fetch();
    }
}) as LayoutLoad;