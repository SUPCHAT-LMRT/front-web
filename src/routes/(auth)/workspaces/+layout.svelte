<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as Tooltip from "$lib/components/ui/tooltip";
    import * as Dialog from "$lib/components/ui/dialog";
    import workspacesStore from "$lib/stores/workspacesStore";
    import {onMount} from "svelte";
    import {Globe, Plus} from "lucide-svelte";
    import {Input} from "$lib/components/ui/input";
    import {Label} from "$lib/components/ui/label";
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import {Skeleton} from "$lib/components/ui/skeleton/index.js";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {WorkspaceType} from "$lib/api/workspaces/workspace";
    import {Button} from "$lib/components/ui/button";
    import {page} from "$app/state";

    const currentWorkspaceId = $derived(page.url.pathname.split("/")?.[2]);

    const workspaces = $state(workspacesStore.get());
    let showInput = $state(false);
    let workspaceName = $state("");
    let workspaceIconImage: File | undefined = $state(null);
    let type: WorkspaceType = $state(WorkspaceType.PRIVATE);
    let isLoading = $state(true);
    let dialogOpen = $state(false);

    onMount(() => {
        try {
            workspacesStore.fetch();
            isLoading = false;
        } catch (error) {
            console.error("Erreur lors de la récupération des workspaces :", error);
        }
    });

    function handleCreateMineClick() {
        showInput = true;
    }

    async function createNewWorkspace() {
        try {
            const workspace = await workspacesStore.createWorkspace(workspaceName, type, workspaceIconImage);
            console.log("Workspace créé : ", workspace);
            workspaceIconImage = null;
            workspaceName = "";
            type = WorkspaceType.PRIVATE;
            showInput = false;
            dialogOpen = false;
        } catch (error) {
            console.error("Erreur lors de la création du workspace :", error);
        }
    }

    let {children} = $props();
</script>

<div class="flex w-full h-full">
    <Sidebar.Root class="border-l-2 border-r-2 border-gray-200">
        <Sidebar.Content>
            <Sidebar.Group class="p-0">
                <Sidebar.GroupContent>
                    <Sidebar.Menu class="flex mx-auto flex-col items-center">
                        {#if isLoading}
                            <Skeleton class="h-12 w-12 mb-4 mt-2 rounded-full"/>
                            <Skeleton class="h-12 w-12 mb-4 rounded-full"/>
                            <Skeleton class="h-12 w-12 rounded-full"/>
                        {:else}
                            {#each workspaces.data.workspaces as workspace (workspace.id)}
                                <div class="relative flex items-center group/icon">
                                    {#if currentWorkspaceId === workspace.id}
                                        <div class="absolute h-2/4 border-l-4 border-primary rounded-r-full group-hover/icon:h-3/4 transition-height duration-50"></div>
                                    {/if}

                                    <Tooltip.Root>
                                        <Tooltip.Trigger class="h-full">
                                            <Sidebar.MenuItem class="mb-[2px] w-full flex justify-center px-4">
                                                <Sidebar.MenuButton
                                                        class="flex items-center justify-center p-2 h-16 w-16 transition-all duration-300">
                                                    <a href="/workspaces/{workspace.id}"
                                                       class="avatar-link flex items-center justify-center w-full h-full">
                                                        <Avatar.Root
                                                                class="h-12 w-12 rounded-3xl transition-all hover:rounded-2xl hover:scale-105">
                                                            {#key workspace.id}
                                                                <Avatar.Image
                                                                        src={getS3ObjectUrl(S3Bucket.WORKSPACES_ICONS, workspace.id)}
                                                                        alt={workspace.name}
                                                                        class="h-full w-full object-cover"
                                                                />
                                                            {/key}

                                                            <Avatar.Fallback class="rounded-3xl transition-all hover:rounded-2xl hover:scale-105">
                                                                {workspace.name[0].toUpperCase()}
                                                            </Avatar.Fallback>
                                                        </Avatar.Root>
                                                    </a>
                                                </Sidebar.MenuButton>
                                            </Sidebar.MenuItem>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content>
                                            <p>{workspace.name}</p>
                                        </Tooltip.Content>
                                    </Tooltip.Root>
                                </div>
                            {/each}
                        {/if}

                        <Sidebar.MenuItem class="mt-4 w-full flex justify-center">
                            <Dialog.Root bind:open={dialogOpen}>
                                <Dialog.Trigger>
                                    <div class="flex items-center justify-center p-2 h-12 w-12 rounded-3xl transition-all hover:rounded-2xl hover:scale-105 bg-gray-200 hover:bg-gray-300">
                                        <Plus class="h-4 w-4"/>
                                    </div>
                                </Dialog.Trigger>
                                <Dialog.Content class="sm:max-w-[425px]">
                                    <Dialog.Header
                                            class="flex flex-col items-center justify-center text-center relative h-full">
                                        <div class="text-center">
                                            <Dialog.Title class="text-2xl font-bold">
                                                Crée ton serveur
                                            </Dialog.Title>
                                            <p class="text-sm mt-2 text-gray-700">
                                                Ton serveur est l&apos;endroit où tu retrouves tes amis. Crée le tien et
                                                lance une discussion.
                                            </p>
                                        </div>
                                    </Dialog.Header>

                                    <div class="space-y-4 mt-4">
                                        {#if !showInput}
                                            <Sidebar.MenuButton
                                                    class="w-full justify-between h-16 border hover:bg-gray-200"
                                                    onclick={handleCreateMineClick}>
                                                <div class="flex items-center gap-3">
                                                    <div class="p-2 rounded-full">
                                                        <Globe class="h-6 w-6"/>
                                                    </div>
                                                    <span class="font-medium">Créer le mien</span>
                                                </div>
                                                <div class="text-gray-400">→</div>
                                            </Sidebar.MenuButton>
                                        {:else}
                                            <div class="w-full">
                                                <Input bind:value={workspaceName} type="text"
                                                       placeholder="Nom du serveur"
                                                       class="w-full p-2 border rounded-md mb-4"/>
                                                <div class="grid w-full max-w-sm items-center gap-1.5">
                                                    <Input onchange={({currentTarget}) => {
                                                        workspaceIconImage = currentTarget.files?.[0];
                                                    }} id="picture" type="file"
                                                           accept="image/png, image/jpeg, image/webp" />
                                                </div>
                                                <RadioGroup.Root bind:value={type} class="pt-4">
                                                    <div class="flex items-center space-x-2">
                                                        <RadioGroup.Item value="PRIVATE" id="r1"/>
                                                        <Label for="r1">Privé</Label>
                                                    </div>
                                                    <div class="flex items-center space-x-2">
                                                        <RadioGroup.Item value="PUBLIC" id="r2"/>
                                                        <Label for="r2">Public</Label>
                                                    </div>
                                                </RadioGroup.Root>
                                            </div>
                                        {/if}

                                        <div class="flex justify-between gap-x-4 pt-4">
                                            {#if showInput}
                                                <Button
                                                        variant="ghost"
                                                        class="h-10 w-max justify-start"
                                                        onclick={() => showInput = false}>
                                                    <div class="text-gray-400">&larr;</div>
                                                    Retour
                                                </Button>

                                                <div class="float-end">
                                                    <Button onclick={createNewWorkspace}
                                                            class="justify-center w-full h-10 px-6 bg-primary text-white">
                                                        Créer un serveur
                                                    </Button>
                                                </div>
                                            {:else}
                                                <div class="w-full">
                                                    <p class="text-sm text-gray-500 mb-2">Tu as déjà une invitation
                                                        ?</p>
                                                    <Button class="w-full justify-center h-10">
                                                        Rejoindre un serveur
                                                    </Button>
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                </Dialog.Content>
                            </Dialog.Root>
                        </Sidebar.MenuItem>
                    </Sidebar.Menu>
                </Sidebar.GroupContent>
            </Sidebar.Group>
        </Sidebar.Content>
    </Sidebar.Root>

    {@render children()}
</div>
