<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {Label} from "$lib/components/ui/label";
    import {Switch} from "$lib/components/ui/switch";
    import {AlertTriangle} from "lucide-svelte";
    import {onMount} from "svelte";
    import {getWorkspace, updateTypeWorkspace, WorkspaceType} from "$lib/api/workspaces/workspace";
    import {page} from "$app/state";
    import {notifyByLevel, success} from "$lib/toast/toast";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let workspaceType: WorkspaceType = $state(null);

    onMount(async () => {
        const workspace = await getWorkspace(currentWorkspaceId);
        if (workspace) {
            workspaceType = workspace.type;
            console.log("Workspace type:", workspaceType);
        } else {
            console.error("Workspace not found");
        }
    });

    const handleSave = async () => {
        try {
            await updateTypeWorkspace(currentWorkspaceId, workspaceType);
            success("Succès", "Le type de l'espace de travail a été mis à jour avec succès.");
        } catch (err) {
            notifyByLevel({
                title: "Erreur",
                level: "error",
                message: "Une erreur est survenue lors de la mise à jour du type de l'espace de travail.",
            });
            console.error("Error updating workspace type:", err);
        }
    };

    const togglePrivacy = () => {
        workspaceType = workspaceType === WorkspaceType.PUBLIC
            ? WorkspaceType.PRIVATE
            : WorkspaceType.PUBLIC;
    };



</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Confidentialité de l'espace de travail</h2>
        <Button class="text-white" onclick={handleSave}>Sauvegarder</Button>
    </div>

    <Card>
        <CardHeader>
            <CardTitle>Confidentialité de l'espace de travail</CardTitle>
            <CardDescription>Définissez qui peut accéder à votre espace de travail</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
            <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                    <Label for="public-mode">Mode Public</Label>
                    <p class="text-sm text-muted-foreground">
                        {#if workspaceType === WorkspaceType.PUBLIC}
                            Votre espace de travail est visible par tous
                        {:else}
                            Votre espace de travail est privé et accessible sur invitation uniquement
                        {/if}
                    </p>
                </div>
                {#if workspaceType !== null}
                    <Switch
                            id="public-mode"
                            checked={workspaceType === WorkspaceType.PUBLIC}
                            onchange={togglePrivacy}
                    />
                {/if}
            </div>

            <div class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <div class="flex">
                    <AlertTriangle class="h-5 w-5 text-yellow-800 dark:text-yellow-500"/>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-500">Attention</h3>
                        <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <p>
                                En mode public, n'importe qui peut trouver et rejoindre votre espace de travail.
                                Assurez-vous que c'est
                                bien ce que vous souhaitez.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</div>
