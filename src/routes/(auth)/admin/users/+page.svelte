<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger
    } from "$lib/components/ui/dropdown-menu";
    import { MoreHorizontal, UserMinus, UserPen } from "lucide-svelte";
    import { listAllUsers, deleteUser as apiDeleteUser } from "$lib/api/user";
    import { getS3ObjectUrl, S3Bucket } from "$lib/api/s3";
    import { fallbackAvatarLetters } from "$lib/utils/fallbackAvatarLetters.js";

    type UserItem = { id: string; name: string; email: string };
    let users: UserItem[] = [];

    let openMenuFor: string | null = null;
    let alertOpen = false;
    let userToRemove: string | null = null;

    onMount(async () => {
        try {
            const data = await listAllUsers();
            users = data.map(u => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email
            }));
        } catch (err) {
            console.error(err);
        }
    });

    function onClickDelete(id: string) {
        openMenuFor = null;
        userToRemove = id;
        alertOpen = true;
    }

    async function confirmRemove() {
        if (!userToRemove) return;
        try {
            await apiDeleteUser(userToRemove);
            users = users.filter(u => u.id !== userToRemove);
        } catch (err) {
            console.error("Erreur lors de la suppression :", err);
        } finally {
            alertOpen = false;
            userToRemove = null;
        }
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-700">Gestion des utilisateurs</h2>
    </div>

    <Card>
        <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>Gérez les utilisateurs de votre application</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Avatar</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead class="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {#each users as user}
                        <TableRow>
                            <TableCell>
                                <Avatar.Root>
                                    <Avatar.Image
                                            src={`${getS3ObjectUrl(S3Bucket.USERS_AVATARS, user.id)}?${Date.now()}`}
                                    />
                                    <Avatar.Fallback>
                                        <div class="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 font-bold rounded-full">
                                            {fallbackAvatarLetters(user.name)}
                                        </div>
                                    </Avatar.Fallback>
                                </Avatar.Root>
                            </TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell class="text-right">
                                <DropdownMenu
                                        open={openMenuFor === user.id}
                                        onopenChange={(e: CustomEvent<boolean>) => {
                                        openMenuFor = e.detail ? user.id : null;
                                    }}
                                >
                                    <DropdownMenuTrigger>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal class="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onclick={() => {/* TODO modif */}}>
                                            <UserPen class="mr-2 h-4 w-4"/> Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                                class="text-red-500"
                                                onclick={() => onClickDelete(user.id)}
                                        >
                                            <UserMinus class="mr-2 h-4 w-4"/> Supprimer
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
            <AlertDialog.Action onclick={confirmRemove}>Confirmer</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
