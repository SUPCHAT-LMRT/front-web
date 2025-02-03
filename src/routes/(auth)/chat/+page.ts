import type {PageLoad} from "./$types";
import {redirect} from "@sveltejs/kit";

export const load = (async () => {
    const currentRecentChat = localStorage.getItem("currentRecentChat");

    // Redirect to the last selected chat if there is one
    if (currentRecentChat) {
        const [chatKind, chatId] = currentRecentChat.split("/");
        return redirect(302, `/chat/${chatKind}/${chatId}`);
    }
}) as PageLoad;
