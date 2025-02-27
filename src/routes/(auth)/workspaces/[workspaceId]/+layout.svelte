<script lang="ts">
    import workspaceChannelsStore from "$lib/stores/workspaceChannelsStore";
    import {page} from "$app/state";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import type {Channel} from "$lib/api/workspaces/channels";
    import ws from "$lib/api/ws";
    import CreateChannelDialog from "$lib/components/app/workspaces/CreateChannelDialog.svelte";
    import {Separator} from "$lib/components/ui/separator";
    import {goto} from "$app/navigation";

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

    // $effect to send the selectWorkspace message to the server when the workspace changes
    $effect(() => {
        ws.selectWorkspace(currentWorkspaceId);

        return () => {
            ws.unselectWorkspace();
        }
    })

    $effect(() => {
        const unsubscribeChannelCreated = ws.subscribe("channel-created", msg => {
            const channelCreated = msg.channel as Channel;
            if (channelCreated.workspaceId !== currentWorkspaceId) return; // This is not supposed to happen but just in case (because it's handled by the server)
            workspaceChannelsStore.put(channelCreated);
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

<div class="flex w-full justify-between dark:bg-gray-900">
    <div class="h-screen w-full">
        {@render children?.()}
    </div>

    <Sidebar.Root class="h-full border-l-2 border-r-2 border-gray-200 dark:border-gray-700">
        <ContextMenu.Root>
            <ContextMenu.Trigger class="h-full">
                <Sidebar.Content class="h-full flex justify-between dark:bg-gray-800">
                    <Sidebar.Group class="p-0">
                        <Sidebar.MenuButton class="flex mx-auto flex-col items-center mb-2"
                                            onclick={() => goto("/workspaces")}>Vue d'ensemble
                        </Sidebar.MenuButton>
                        <Separator class="dark:bg-gray-700"/>
                        <Sidebar.GroupLabel>Canaux</Sidebar.GroupLabel>
                        <Sidebar.GroupContent>
                            <Sidebar.Menu class="flex mx-auto flex-col items-center min-w-64">

                                {#each channels.data.channels as channel (channel.id)}
                                    <a href="/workspaces/{currentWorkspaceId}/channels/{channel.id}"
                                       class="mb-[2px] w-full flex justify-center px-4">
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
                                        <CreateChannelDialog {createChannelData} {createChannel}/>
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