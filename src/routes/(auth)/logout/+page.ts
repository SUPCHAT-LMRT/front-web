import { logout } from "$lib/api/user";
import { goto } from "$lib/utils/goto";
import type { PageLoad } from "./$types";

export const load = (async () => {
  await logout();
  goto("/login");
}) as PageLoad;
