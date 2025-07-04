<script lang="ts">
    import {Badge} from "$lib/components/ui/badge";
    import {ScrollArea} from "$lib/components/ui/scroll-area";
    import {Trash2} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button";
    import {onMount} from "svelte";
    import {page} from "$app/state";
    import {success} from "$lib/toast/toast";
    import {
        getListWorkspaceRoles,
        deleteWorkspaceRole,
        type WorkspaceRole,
    } from "$lib/api/workspaces/roles";
    import * as Dialog from "$lib/components/ui/dialog";
    import {roleList} from "./state.svelte";
    import {writable} from "svelte/store";
    import {AxiosError} from "axios";

    let loading = $state(true);
    let showDeleteConfirmation = $state(false);
    let roleToDelete = $state<string | null>(null);

    const {workspaceId} = page.params;
    let {selectedRole = $bindable()}: { selectedRole: WorkspaceRole | null } = $props();
    let error = writable("");

    const handleRoleSelect = (role: WorkspaceRole) => {
        selectedRole = role;
    };

    onMount(async () => {
        try {
            roleList.roles = await getListWorkspaceRoles(workspaceId);
            if (roleList.roles.length > 0) {
                selectedRole = roleList.roles[0];
            }
        } catch (e) {
            console.error(e);
            error.set("Erreur lors du chargement des rôles.");
            if (e instanceof AxiosError) {
                if (e.response?.status === 403) {
                    error.set("Vous n'avez pas la permission de voir les rôles.");
                } else if (e.response?.status === 404) {
                    error.set("Espace de travail introuvable.");
                } else {
                    error.set("Erreur inconnue lors du chargement des rôles.");
                }
            } else {
                error.set("Erreur inconnue lors du chargement des rôles.");
            }
        } finally {
            loading = false;
        }
    });

    const handleDeleteRole = (roleId: string, event: Event) => {
        event.stopPropagation();
        roleToDelete = roleId;
        showDeleteConfirmation = true;
    };

    const confirmDeleteRole = async () => {
        if (!roleToDelete) return;

        try {
            await deleteWorkspaceRole(workspaceId, roleToDelete);
            success("Rôle supprimé", "Le rôle a été supprimé avec succès.");
            // Mettre à jour la liste après suppression
            roleList.roles = roleList.roles.filter(role => role.id !== roleToDelete);

            // Si le rôle supprimé était sélectionné, sélectionner un autre rôle
            if (selectedRole && selectedRole.id === roleToDelete) {
                selectedRole = roleList.roles.length > 0 ? roleList.roles[0] : null;
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du rôle :", error);
        } finally {
            showDeleteConfirmation = false;
            roleToDelete = null;
        }
    };

    const cancelDeleteRole = () => {
        showDeleteConfirmation = false;
        roleToDelete = null;
    };
</script>

<ScrollArea class="h-[400px] pr-4">
    <div class="space-y-2">
        {#if loading}
            <p>Chargement des rôles...</p>
        {:else if roleList.roles.length === 0}
            <p>Aucun rôle disponible.</p>
        {:else}
            {#each roleList.roles as role}
                <button
                        type="button"
                        class="w-full flex items-center justify-between rounded-md p-2 text-left cursor-pointer transition
                                                    {selectedRole?.id === role.id ? 'bg-accent' : 'hover:bg-accent/50'}"
                        onclick={() => handleRoleSelect(role)}
                >
                    <div class="flex items-center gap-2">
                        <Badge
                                style="background-color: {role.color}"
                                class="text-white max-w-[180px] truncate"
                                title={role.name}
                        >
                            {role.name}
                        </Badge>
                    </div>
                    <div class="flex gap-1">
                        {#if role.name !== "Owner"}
                            <Button variant="ghost" size="icon" class="h-7 w-7"
                                    onclick={(event) => handleDeleteRole(role.id, event)}>
                                <Trash2 class="h-4 w-4"/>
                            </Button>
                        {/if}
                    </div>
                </button>
            {/each}
        {/if}
    </div>
</ScrollArea>

<!-- Dialog de confirmation de suppression -->
<Dialog.Root open={showDeleteConfirmation} onOpenChange={(open) => showDeleteConfirmation = open}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Confirmer la suppression</Dialog.Title>
            <Dialog.Description>
                Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.
            </Dialog.Description>
        </Dialog.Header>
        <div class="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onclick={cancelDeleteRole}>Annuler</Button>
            <Button variant="destructive" onclick={confirmDeleteRole}>Supprimer</Button>
        </div>
    </Dialog.Content>
</Dialog.Root>