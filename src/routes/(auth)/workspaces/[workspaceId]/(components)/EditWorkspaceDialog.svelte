<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";
    import { writable } from "svelte/store";

    let editWorkspaceData = writable({
        dialogOpen: false,
        name: "",
        description: ""
    });

    const saveWorkspaceChanges = () => {
        console.log("Modifications enregistrées :", $editWorkspaceData);
        editWorkspaceData.update(data => ({ ...data, dialogOpen: false }));
    };
</script>

<Dialog.Root bind:open={$editWorkspaceData.dialogOpen}>
    <Dialog.Trigger class="mx-auto">
        Modifier le Workspace
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header class="flex flex-col items-center justify-center text-center relative h-full">
            <div class="text-center">
                <Dialog.Title class="text-2xl font-bold">
                    Modifier le Workspace
                </Dialog.Title>
                <p class="text-sm mt-2 text-gray-700">
                    Change les informations de ton workspace.
                </p>
            </div>
        </Dialog.Header>

        <div class="w-full">
            <Input bind:value={$editWorkspaceData.name} type="text"
                   placeholder="Nom du Workspace"
                   class="w-full p-2 border rounded-md mb-4"/>
            <Textarea bind:value={$editWorkspaceData.description}
                      placeholder="Description du Workspace"
                      class="w-full p-2 border rounded-md mb-4"/>
        </div>

        <div class="flex justify-end gap-2">
            <Button onclick={() => editWorkspaceData.update(data => ({ ...data, dialogOpen: false }))} class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700">
                Annuler
            </Button>
            <Button onclick={saveWorkspaceChanges} class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">
                Enregistrer
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>
