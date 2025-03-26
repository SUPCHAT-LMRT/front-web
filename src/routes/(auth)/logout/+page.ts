import type { PageLoad } from "./$types";
import { logout } from "$lib/api/user";
import { goto } from "$lib/utils/goto";

export const load = (async () => {
  await logout();
  goto("/");
}) as PageLoad;
