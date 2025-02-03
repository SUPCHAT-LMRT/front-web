<script lang="ts">
    import workspaceChannelsStore from "$lib/stores/workspaceChannelsStore";
    import {page} from "$app/state";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as Dialog from "$lib/components/ui/dialog";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import {Textarea} from "$lib/components/ui/textarea";
    import {Input} from "$lib/components/ui/input";
    import {Button} from "$lib/components/ui/button";
    import type {Channel} from "$lib/api/workspaces/channels";
    import ws from "$lib/api/ws";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let channels = $state(workspaceChannelsStore.get());
    let createChannelData = $state({
        dialogOpen: false,
        name: "",
        topic: ""
    })

    // $effect to allow the store to fetch the data when changing workspace
    $effect(() => {
        workspaceChannelsStore.clearData();
        workspaceChannelsStore.fetch(currentWorkspaceId);
    })

    $effect(() => {
        const unsubscribeChannelCreated = ws.subscribe("channel-created", msg => {
            workspaceChannelsStore.put(msg.payload as Channel);
        })

        return () => {
            unsubscribeChannelCreated();
        }
    })

    const createChannel = async () => {
        try {
            await workspaceChannelsStore.create(currentWorkspaceId, createChannelData.name, createChannelData.topic);
            createChannelData = {
                dialogOpen: false,
                name: "",
                topic: ""
            }
        } catch (e) {
            console.error(e);
        }
    }

    const {children} = $props();
</script>

<div class="flex w-full justify-between">
    <div class="h-screen w-full">
        {@render children()}
    </div>

    <Sidebar.Root class="h-full border-l-2 border-r-2 border-gray-200">
        <ContextMenu.Root>
            <ContextMenu.Trigger class="h-full">
                <Sidebar.Content class="h-full flex justify-between">

                    <Sidebar.Group class="p-0">
                        <Sidebar.GroupLabel>Canaux</Sidebar.GroupLabel>
                        <Sidebar.GroupContent>
                            <Sidebar.Menu class="flex mx-auto flex-col items-center min-w-64">

                                {#each channels.data.channels as channel (channel.id)}
                                    <a href="/workspaces/{currentWorkspaceId}/channels/{channel.id}"  class="mb-[2px] w-full flex justify-center px-4">
                                        <Sidebar.MenuItem>
                                            <Sidebar.MenuButton>
                                                {channel.name}
                                            </Sidebar.MenuButton>
                                        </Sidebar.MenuItem>
                                    </a>
                                {/each}

                            </Sidebar.Menu>
                        </Sidebar.GroupContent>
                    </Sidebar.Group>

                    <Sidebar.Group class="p-0">
                        <Sidebar.GroupContent>
                            <Sidebar.Menu class="flex mx-auto flex-col items-center min-w-64">

                                <Sidebar.MenuItem class="mb-[2px] w-full flex justify-center px-4">
                                    <Sidebar.MenuButton>
                                        <Dialog.Root bind:open={createChannelData.dialogOpen}>
                                            <Dialog.Trigger class="mx-auto text-xl underline">
                                                Créer un canal
                                            </Dialog.Trigger>
                                            <Dialog.Content class="sm:max-w-[425px]">
                                                <Dialog.Header
                                                        class="flex flex-col items-center justify-center text-center relative h-full">
                                                    <div class="text-center">
                                                        <Dialog.Title class="text-2xl font-bold">
                                                            Crée ton serveur
                                                        </Dialog.Title>
                                                        <p class="text-sm mt-2 text-gray-700">
                                                            Ton serveur est l&apos;endroit où tu retrouves tes amis.
                                                            Crée le tien et
                                                            lance une discussion.
                                                        </p>
                                                    </div>
                                                </Dialog.Header>

                                                <div class="w-full">
                                                    <Input bind:value={createChannelData.name} type="text"
                                                           placeholder="Nom du canal"
                                                           class="w-full p-2 border rounded-md mb-4"/>
                                                    <Textarea bind:value={createChannelData.topic}
                                                              placeholder="Topic du canal"
                                                              class="w-full p-2 border rounded-md mb-4"/>
                                                </div>

                                                <div class="float-end">
                                                    <Button onclick={createChannel}
                                                            class="justify-center w-full h-10 px-6 bg-primary text-white">
                                                        Créer un canal
                                                    </Button>
                                                </div>
                                            </Dialog.Content>
                                        </Dialog.Root>
                                    </Sidebar.MenuButton>
                                </Sidebar.MenuItem>

                            </Sidebar.Menu>
                        </Sidebar.GroupContent>
                    </Sidebar.Group>

                </Sidebar.Content>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <ContextMenu.Item>Créer un canal</ContextMenu.Item>
                <ContextMenu.Item>Billing</ContextMenu.Item>
                <ContextMenu.Item>Team</ContextMenu.Item>
                <ContextMenu.Item>Subscription</ContextMenu.Item>
            </ContextMenu.Content>
        </ContextMenu.Root>
    </Sidebar.Root>
</div>