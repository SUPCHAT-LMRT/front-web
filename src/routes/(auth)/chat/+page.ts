import type {PageLoad} from "./$types";
import recentChatsStore from "../../../lib/stores/recentChatsStore";
import {redirect} from "@sveltejs/kit";

export const load = (async () => {
    const recentChats = recentChatsStore.get();

    // Redirect to the first chat if there is one
    if (recentChats?.data?.recentChats?.length > 0) {
        const lastRecentChat = recentChats.data.recentChats[0];
        return redirect(302, `/chat/${lastRecentChat.kind}/${lastRecentChat.id}`);
    }
}) as PageLoad;
