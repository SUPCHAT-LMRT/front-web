<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import RoleCreator from "./RoleCreator.svelte";
    import {Dialog, DialogContent, DialogHeader, DialogTitle} from "$lib/components/ui/dialog";
    import {
        createWorkspaceRole,
        updateWorkspaceRole,
        type WorkspaceRole
    } from "$lib/api/workspaces/roles";
    import {page} from "$app/state";
    import {AxiosError} from "axios";
    import {writable} from "svelte/store";
    import AppMembers from "./AppMembers.svelte";
    import {roleList} from "../../workspaces/[workspaceId]/settings/roles/state.svelte";

    let selectedRole: WorkspaceRole | null = $state(null);
    let showModal = $state(false);
    const {workspaceId} = page.params;
    let error = writable("");


    const handleSave = async () => {
        if (selectedRole) {
            try {
                console.log(workspaceId, selectedRole.id, selectedRole.name, selectedRole.permissions, selectedRole.color);
                await updateWorkspaceRole(workspaceId, selectedRole.id, selectedRole.name, selectedRole.permissions, selectedRole.color);
            } catch (e) {
                console.error(e);
                error.set("Erreur lors de la mise à jour du rôle.");
                if (e instanceof AxiosError) {
                    if (e.response?.status === 403) {
                        error.set("Vous n'avez pas la permission de modifier ce rôle.");
                    } else if (e.response?.status === 404) {
                        error.set("Rôle introuvable.");
                    } else {
                        error.set("Erreur inconnue lors de la mise à jour du rôle.");
                    }
                } else {
                    error.set("Erreur inconnue lors de la mise à jour du rôle.");
                }
            }
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
        } catch (e) {
            console.error(e);
            error.set("Erreur lors de la création du rôle.");
            if (e instanceof AxiosError) {
                if (e.response?.status === 403) {
                    error.set("Vous n'avez pas la permission de créer un rôle.");
                } else if (e.response?.status === 404) {
                    error.set("Espace de travail introuvable.");
                } else {
                    error.set("Erreur inconnue lors de la création du rôle.");
                }
            } else {
                error.set("Erreur inconnue lors de la création du rôle.");
            }
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
<!--                            <RolesList bind:selectedRole={selectedRole}/>-->
                        </CardContent>
                        <div class="p-4 flex justify-center items-center flex-grow-0">
                            <Button class="text-white w-full" onclick={() => (showModal = true)}>Créer un rôle</Button>
                        </div>
                    </Card>
                </div>

                <div class="md:col-span-1">
                    <Card class="h-full flex flex-col">
                        <CardContent class="flex-grow">
                            <AppMembers/>
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