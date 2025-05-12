<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {onMount} from "svelte";
    import { kickWorkspaceMember} from "$lib/api/workspaces/workspace";
    import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "$lib/components/ui/table";
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuTrigger
    } from "$lib/components/ui/dropdown-menu";
    import { MoreHorizontal, UserMinus} from "lucide-svelte";
    import {page} from "$app/state";
    import {listAllUsers} from "$lib/api/user";

    const {workspaceId} = page.params;
    let users = $state([]);

    onMount(async () => {
        try {
            const data = await listAllUsers();
            users = data.map(user => ({
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
                role: user.role
            }));
        } catch (error) {
            console.error("Erreur lors de la récupération des membres :", error);
        }
    });

    const handleRemoveMember = async (memberId: string) => {
        try {
            await kickWorkspaceMember(workspaceId, memberId);
            users = users.filter(member => member.id !== memberId);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur :", error);
        }
    };
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Gestion des invitations</h2>
        <Button class="text-white">Inviter un utilisateur</Button>
    </div>

    <Card>
        <CardHeader>
            <CardTitle>Liste des invitations</CardTitle>
            <CardDescription>Gérez les invitations de votre application</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-24">Avatar</TableHead>
                        <TableHead class="w-24">Nom</TableHead>
                        <TableHead class="w-24 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {#each users as member}
                        <TableRow>
                            <TableCell class="w-24">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-700 dark:text-gray-300">
                                        {member.pseudo.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell class="w-24">
                                <div class="flex items-center gap-2">
                                    {member.pseudo}
                                </div>
                            </TableCell>
                            <TableCell class="w-24 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal class="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                                onclick={() => handleRemoveMember(member.id)}
                                                class="text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white"
                                        >
                                            <UserMinus class="mr-2 h-4 w-4"/>
                                            Retirer du workspace
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