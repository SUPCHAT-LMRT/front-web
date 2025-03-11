import type { PageLoad } from "./$types";

export const load = (async ({ params }) => {
  localStorage.setItem("currentRecentChat", "direct/" + params.chatId);
}) as PageLoad;
