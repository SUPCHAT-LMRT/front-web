<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import RoleCreator from "./RoleCreator.svelte";
    import RolePermissions from "./RolePermissions.svelte";
    import RolesList from "./RoleList.svelte";
    import {Dialog, DialogContent, DialogHeader, DialogTitle} from "$lib/components/ui/dialog";
    import {createWorkspaceRole, updateWorkspaceRole, type WorkspaceRole} from "$lib/api/workspaces/roles";
    import {page} from "$app/state";
    import {roleList} from "./state.svelte";
    import WorkspaceMembers from "./WorkspaceMembers.svelte";

    let selectedRole: WorkspaceRole | null = $state(null);
    let showModal = $state(false);
    const {workspaceId} = page.params;


    const handleSave = async () => {
        if (selectedRole) {
            try {
                console.log(workspaceId, selectedRole.id, selectedRole.name, selectedRole.permissions, selectedRole.color);
                await updateWorkspaceRole(workspaceId, selectedRole.id, selectedRole.name, selectedRole.permissions, selectedRole.color);
            } catch (error) {
                console.error("Erreur lors de la mise à jour des permissions :", error);
            }
        } else {
            console.error("Aucun rôle sélectionné pour la mise à jour des permissions.");
        }
    };

    const handleRoleCreated = async (role) => {
        try {
            const createdRole = await createWorkspaceRole(workspaceId, role.name, role.color);

            console.log("Rôle créé:", createdRole);

            roleList.roles = [...roleList.roles, createdRole];

            if (!selectedRole) {
                selectedRole = createdRole;
            }

            showModal = false;
        } catch (error) {
            console.error("Erreur lors de la création du rôle:", error);
        }
    };
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Gestion des Rôles</h2>
        <Button class="text-white" onclick={handleSave}>Sauvegarder</Button>
    </div>

    <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div class="md:col-span-1">
                <Card class="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Rôles</CardTitle>
                        <CardDescription>Sélectionnez un rôle pour modifier ses permissions</CardDescription>
                    </CardHeader>
                    <CardContent class="flex-grow">
                        <RolesList bind:selectedRole={selectedRole}/>
                    </CardContent>
                    <div class="p-4 flex justify-center items-center flex-grow-0">
                        <Button class="text-white w-full" onclick={() => (showModal = true)}>Créer un rôle</Button>
                    </div>
                </Card>
            </div>

            <div class="md:col-span-2">
                <Card class="h-full">
                    <CardHeader>
                        <CardTitle>Permissions des rôles</CardTitle>
                        <CardDescription>Configurez les permissions pour le rôle sélectionné</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {#if selectedRole}
                            <RolePermissions bind:role={selectedRole}/>
                        {:else}
                            <div class="text-center py-8 text-muted-foreground">
                                Sélectionnez un rôle pour voir ses permissions
                            </div>
                        {/if}
                    </CardContent>
                </Card>
            </div>
            <div class="md:col-span-1">
                <Card class="h-full flex flex-col">
                    <CardContent class="flex-grow">
                        <WorkspaceMembers/>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</div>

<!-- Modal pour créer un rôle -->
<Dialog open={showModal} onOpenChange={(open) => (showModal = open)}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Créer un nouveau rôle</DialogTitle>
        </DialogHeader>
        <RoleCreator onRoleCreated={handleRoleCreated}/>
    </DialogContent>
</Dialog>