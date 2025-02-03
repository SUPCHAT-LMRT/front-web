import type {PageLoad} from "./$types";
import {redirect} from "@sveltejs/kit";

export const load = (async ({parent}) => {
    const {recentChats} = await parent();

    // Redirect to the first chat if there is one
    if (recentChats?.length > 0) {
        const lastRecentChat = recentChats[0];
        return redirect(302, `/chat/${lastRecentChat.kind}/${lastRecentChat.id}`);
    }
}) as PageLoad;
