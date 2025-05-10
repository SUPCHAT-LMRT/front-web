import {getLoginUser, PrivateStatus} from "$lib/api/user";
import ws from "$lib/api/ws";
import {goto} from "$lib/utils/goto";
import type {LayoutLoad} from "./$types";
import {getWorkspaceMemberId} from "$lib/api/workspaces/workspace";

export const load: LayoutLoad = async ({parent, params}): Promise<{ member: { id: string, memberId?: string } }> => {
    const {authenticatedUserState} = await parent();
    const {workspaceId} = params;
    try {
        console.log("data", await parent());
        authenticatedUserState.user = await getLoginUser();
    } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur :", error);
    }

    if (!authenticatedUserState.user) {
        goto("/login");
    }

    let memberId: string | undefined;
    if (workspaceId && authenticatedUserState.user) {
        try {
            memberId = await getWorkspaceMemberId(workspaceId, authenticatedUserState.user.id);
        } catch (error) {
            console.error("Erreur lors de la récupération du memberId :", error);
        }
    }

    ws.subscribe(
        "self-status-updated",
        (msg: { status: PrivateStatus }) => {
            authenticatedUserState.user.status = msg.status;
        },
    );

    ws.initWebSocket();

    return {
        member: {
            id: authenticatedUserState.user.id,
            memberId
        },
    };
};