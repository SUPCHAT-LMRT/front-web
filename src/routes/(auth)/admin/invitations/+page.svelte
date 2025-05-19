<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {onMount} from "svelte";
    import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "$lib/components/ui/table";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import {success, notifyByLevel} from "$lib/toast/toast";
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger
    } from "$lib/components/ui/dropdown-menu";
    import {MoreHorizontal, UserMinus} from "lucide-svelte";
    import {getInviteLink, deleteInviteLink} from "$lib/api/admin";

    let inviteLInk = $state([]);
    let alertOpen = $state(false);
    let linkToRemove: string | null = $state(null);
    let openMenuFor = $state(null);


    function onClickDelete(token: string) {
        openMenuFor = null;
        linkToRemove = token;
        alertOpen = true;
    }


    onMount(async () => {
        try {
            const data = await getInviteLink();
            inviteLInk = data.map((invite) => ({
                email: invite.email,
                token: invite.token,
                expiresAt: new Date(invite.expiresAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                })
            }));
        } catch (error) {
            console.error("Erreur lors de la récupération des invitations :", error);
        }
    });

    async function handleRemoveInviteLink() {
        if (linkToRemove) {
            try {
                await deleteInviteLink(linkToRemove);
                inviteLInk = inviteLInk.filter((invite) => invite.token !== linkToRemove);
                alertOpen = false;
                linkToRemove = null;
                success("Succès", "L'invitation a été supprimée avec succès.");
            } catch (error) {
                console.error("Erreur lors de la suppression de l'invitation :", error);
                notifyByLevel({
                    title: "Erreur",
                    level: "error",
                    message: "Une erreur est survenue lors de la suppression de l'invitation."
                });
            }
        }
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-700">Gestion des invitations</h2>
    </div>

    <Card>
        <CardHeader>
            <CardTitle class="text-gray-700">Liste des invitations en cours</CardTitle>
            <div class="flex justify-between items-center">
                <CardDescription>Gérez les invitations de votre application</CardDescription>
                <Button class="text-white">Inviter un utilisateur</Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-24">Adresse mail</TableHead>
                        <TableHead class="w-24">Date expiration</TableHead>
                        <TableHead class="w-24 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {#each inviteLInk as inviteLink}
                        <TableRow>
                            <TableCell class="w-24">
                                <div class="flex items-center gap-2">
                                    <div class="flex items-center justify-center dark:text-gray-300">
                                        {inviteLink.email}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell class="w-24">
                                <div class="flex items-center gap-2">
                                    {inviteLink.expiresAt}
                                </div>
                            </TableCell>
                            <TableCell class="text-right">
                                <DropdownMenu
                                        open={openMenuFor === inviteLink.token}
                                        onopenChange={(e: CustomEvent<boolean>) => {
                                        openMenuFor = e.detail ? inviteLink.token : null;
                                    }}
                                >
                                    <DropdownMenuTrigger>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal class="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                                class="text-red-500"
                                                onclick={() => onClickDelete(inviteLink.token)}>
                                            <UserMinus class="mr-2 h-4 w-4 text-red-500"/> Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
</div>

<AlertDialog.Root bind:open={alertOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Êtes-vous sûr ?</AlertDialog.Title>
            <AlertDialog.Description>
                Cette action est irréversible. Vous allez supprimer définitivement cet utilisateur.
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Annuler</AlertDialog.Cancel>
            <AlertDialog.Action onclick={() => handleRemoveInviteLink()} class="text-red-500 bg-white border border-gray-200 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white">
                Supprimer
            </AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>