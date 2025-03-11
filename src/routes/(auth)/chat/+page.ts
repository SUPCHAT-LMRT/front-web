import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ parent }) => {
  const { recentChats } = await parent();
  let currentRecentChat = localStorage.getItem("currentRecentChat");

  // The user has recent chats
  if (recentChats.length) {
    // Check if the currentRecentChat is still in the recentChats
    if (!recentChats.find((chat) => chat === currentRecentChat)) {
      localStorage.removeItem("currentRecentChat");
      // Set the currentRecentChat to the first chat in the recentChats
      currentRecentChat = recentChats[0].kind + "/" + recentChats[0].id;
      console.log(
        "currentRecentChat is not in the recentChats, setting it to the first chat in the recentChats",
      );
    }
  } else {
    // The user has no recent chats, todo display a page "No recent chats"
  }

  // Redirect to the last selected chat if there is one
  if (currentRecentChat) {
    const [chatKind, chatId] = currentRecentChat.split("/");
    return redirect(302, `/chat/${chatKind}/${chatId}`);
  }
}) as PageLoad;
