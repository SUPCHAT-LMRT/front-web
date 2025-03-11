import { getLoginUser } from "$lib/api/user";
import { goto } from "$lib/utils/goto";
import type { LayoutLoad } from "./$types";

export const load = (async () => {
  import("$lib/api/ws"); // Connect to the WebSocket server

  let authenticatedUser = null;

  try {
    authenticatedUser = await getLoginUser();
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur :", error);
  }

  if (!authenticatedUser) {
    goto("/login");
  }

  return {
    authenticatedUser,
  };
}) as LayoutLoad;
