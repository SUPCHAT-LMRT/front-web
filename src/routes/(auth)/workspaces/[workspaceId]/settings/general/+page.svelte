<script lang="ts">
    import {Button} from "$lib/components/ui/button";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "$lib/components/ui/card";
    import {Input} from "$lib/components/ui/input";
    import {Label} from "$lib/components/ui/label";
    import {Textarea} from "$lib/components/ui/textarea";
    import {getWorkspace, updateWorkspace} from "$lib/api/workspaces/workspace";
    import {page} from "$app/state";
    import {onMount} from "svelte";
    import {notifyByLevel, success} from "$lib/toast/toast";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let workspaceName = $state("");
    let workspaceTopic = $state("");

    onMount(async () => {
        const workspace = await getWorkspace(currentWorkspaceId);
        if (workspace) {
            workspaceName = workspace.name;
            workspaceTopic = workspace.topic;
        } else {
            console.error("Workspace not found");
        }
    });

    const handleSave = async () => {
        try {
            await updateWorkspace(currentWorkspaceId, workspaceName, workspaceTopic);
            success("Succès", "Le workspace a été mis à jour avec succès.");
        } catch (err) {
            notifyByLevel({
                title: "Erreur",
                level: "error",
                message: "Une erreur est survenue lors de la mise à jour du workspace.",
            });
            console.error("Error updating workspace:", err);
        }
    };
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">Informations du Workspace</h2>
        <Button class="text-white" onclick={handleSave}>Sauvegarder</Button>
    </div>

    <Card>
        <CardHeader>
            <CardTitle>Informations du Workspace</CardTitle>
            <CardDescription>Définissez le nom et le sujet de votre workspace</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
            <div class="space-y-2">
                <Label for="name">Nom du Workspace</Label>
                <Input id="name" bind:value={workspaceName}/>
            </div>
            <div class="space-y-2">
                <Label for="topic">Sujet</Label>
                <Textarea
                        id="topic"
                        placeholder="Décrivez le sujet principal de ce workspace..."
                        bind:value={workspaceTopic}
                        class="min-h-[100px]"
                />
            </div>
        </CardContent>
    </Card>
</div>