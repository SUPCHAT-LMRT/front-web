import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
  localStorage.setItem(
    "currentRecentChat",
    params.chatKind + "/" + params.chatId,
  );
}) as PageLoad;
