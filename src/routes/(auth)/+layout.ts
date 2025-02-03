import { getLoginUser } from "$lib/api/user";
import { goto } from "$lib/utils/goto";
import type { LayoutLoad } from "./$types";

export const load = (async () => {
    let isAuthenticated = false;

    try {
        const user = await getLoginUser();
        isAuthenticated = !!user;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur :", error);
    }

    if (!isAuthenticated) {
        goto("/login");
    }

    return {
        isAuthenticated
    };
}) as LayoutLoad;
