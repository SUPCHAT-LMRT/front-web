<script lang="ts">
    import workspaceChannelsStore from "$lib/stores/workspaceChannelsStore";
    import {page} from "$app/state";
    import * as Sidebar from "$lib/components/ui/sidebar";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {type Channel, deleteWorkspaceChannel, reorderWorkspaceChannel} from "$lib/api/workspaces/channels";
    import ws from "$lib/api/ws";
    import CreateChannelDialog from "$lib/components/app/workspaces/CreateChannelDialog.svelte";
    import {Separator} from "$lib/components/ui/separator";
    import {goto} from "$app/navigation";
    import {dndzone} from "svelte-dnd-action";
    import {flip} from "svelte/animate";
    import {AxiosError} from "axios";
    import {error, notifyByLevel} from "$lib/toast/toast";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let currentMemberId = $derived(page.data.member?.memberId?.member_id);
    let channels = $state(workspaceChannelsStore.get());
    let createChannelData = $state({
        dialogOpen: false,
        name: "",
        topic: "",
        isPrivate: false,
        members: [] as string[]
    });

    $effect(() => {
        workspaceChannelsStore.clearData();
        if (currentMemberId) {
            workspaceChannelsStore.fetch(currentWorkspaceId, currentMemberId);
        }
    });

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

    type ChannelReorderMessage = {
        channelId: string;
        newIndex: number;
    }

    $effect(() => {
        return ws.subscribe(
            "channels-reordered",
            (msg: { channelReorders: ChannelReorderMessage[] }) => {
                channels.data.channels = msg.channelReorders
                    .sort((a, b) => a.newIndex - b.newIndex)
                    .map((msgChannel) => {
                        const channel = channels.data.channels.find((c) => c.id === msgChannel.channelId);
                        return {...channel, order: msgChannel.newIndex};
                    });
            },
        );
    });

    $effect(() => {
        return ws.subscribe("channels-deleted", msg => {
            channels.data.channels = channels.data.channels.filter(channel => channel.id !== msg.channelId);
        })
    })

    const createChannel = async () => {
        try {
            await workspaceChannelsStore.create(
                currentWorkspaceId,
                createChannelData.name,
                createChannelData.topic,
                createChannelData.isPrivate,
                createChannelData.members
            );
            createChannelData = {
                dialogOpen: false,
                name: "",
                topic: "",
                isPrivate: false,
                members: []
            };
        } catch (e) {
            if (e instanceof AxiosError) {
                notifyByLevel({
                    title: "Erreur",
                    level: "error",
                    message: e.response?.data?.displayError,
                });
            }
        }
    }

    const {children} = $props();

    let dialogOpen = $state({
        createChannel: false
    })

    const handleReorder = async () => {
        const reorderedChannels = channels.data.channels.map((channel) => {
            return {
                id: channel.id,
                newIndex: channel.order,
            }
        });

        try {
            await reorderWorkspaceChannel(currentWorkspaceId, reorderedChannels);
        } catch (e) {
            if (e instanceof AxiosError) {
                notifyByLevel({
                    title: "Erreur",
                    level: "error",
                    message: e.response?.data?.displayError,
                });
            }
        }
    };

    const flipDurationMs = 300;

    function handleDndConsider(e) {
        channels.data.channels = e.detail.items;
    }

    function handleDndFinalize(e) {
        channels.data.channels = e.detail.items.map((channel, index) => {
            return {
                ...channel,
                order: index
            }
        });
        handleReorder();
    }

    const handleDeleteChannel = async (channelId: string) => {
        try {
            await deleteWorkspaceChannel(currentWorkspaceId, channelId);
        } catch (e) {
            if (e instanceof AxiosError) {
                error(
                    "Erreur",
                    e.response?.data?.displayError,
                )
            }
        }
    };

</script>

<div class="flex w-full justify-between dark:bg-gray-900">
    <div class="h-full w-full">
        {@render children?.()}
    </div>

    <Sidebar.Root class="h-full border-l-2 border-r-2 border-gray-200 dark:border-gray-700">
        <ContextMenu.Root>
            <ContextMenu.Trigger class="h-full">
                <Sidebar.Content class="h-full flex justify-between dark:bg-gray-800">
                    <Sidebar.Group class="p-0">
                        <Sidebar.MenuButton class="flex mx-auto flex-col items-center mb-2"
                                            onclick={() => goto("/workspaces")}>Vue d'ensembles
                        </Sidebar.MenuButton>
                        <Separator class="dark:bg-gray-700"/>
                        <Sidebar.GroupLabel>Canaux</Sidebar.GroupLabel>
                        <Sidebar.GroupContent>
                            <Sidebar.Menu class="flex mx-auto flex-col items-start pl-6 min-w-64">

                                <section use:dndzone={{items:channels.data.channels, flipDurationMs, dropTargetClasses: [
                                    '!outline-none',
                                ]}} onconsider="{handleDndConsider}" onfinalize="{handleDndFinalize}">
                                    {#each channels.data.channels as channel (channel.id)}
                                        <div animate:flip={{duration: flipDurationMs}} class="mt-4">
                                            <ContextMenu.Root>
                                                <ContextMenu.Trigger>
                                                    <a href="/workspaces/{currentWorkspaceId}/channels/{channel.id}"
                                                       class="w-full">
                                                        <Sidebar.MenuItem class="flex items-start gap-2 w-full">
                                                            <div class="flex items-center h-6 pt-[2px]">
                                                                <span class="text-[#61A0AF] font-bold text-base group-hover:scale-105 transition-transform">#</span>
                                                            </div>
                                                            <div class="flex flex-col overflow-hidden w-full">
                                                                <div class="w-full text-base font-semibold text-left text-gray-900 dark:text-white p-0 h-6 leading-tight">
                                                                    {channel.name}
                                                                </div>
                                                            </div>
                                                        </Sidebar.MenuItem>
                                                    </a>
                                                </ContextMenu.Trigger>

                                                <ContextMenu.Content>
                                                    <ContextMenu.Item onclick={() => handleDeleteChannel(channel.id)}>
                                                        Supprimer
                                                    </ContextMenu.Item>
                                                </ContextMenu.Content>
                                            </ContextMenu.Root>
                                        </div>

                                    {/each}

                                </section>


                            </Sidebar.Menu>
                        </Sidebar.GroupContent>
                        <Sidebar.GroupLabel>Canaux privés</Sidebar.GroupLabel>
                        <Sidebar.GroupContent>
                            <Sidebar.Menu class="flex mx-auto flex-col items-start pl-6 min-w-64">
                                {#each channels.data.privateChannels as privateChannel (privateChannel.id)}
                                    <div class="mt-4">
                                        <ContextMenu.Root>
                                            <ContextMenu.Trigger>
                                                <a href="/workspaces/{currentWorkspaceId}/channels/{privateChannel.id}"
                                                   class="w-full">
                                                    <Sidebar.MenuItem class="flex items-start gap-2 w-full">
                                                        <div class="flex items-center h-6 pt-[2px]">
                                                            <span class="text-[#61A0AF] font-bold text-base group-hover:scale-105 transition-transform">#</span>
                                                        </div>
                                                        <div class="flex flex-col overflow-hidden w-full">
                                                            <div class="w-full text-base font-semibold text-left text-gray-900 dark:text-white p-0 h-6 leading-tight">
                                                                {privateChannel.name}
                                                            </div>
                                                        </div>
                                                    </Sidebar.MenuItem>
                                                </a>
                                            </ContextMenu.Trigger>

                                            <ContextMenu.Content>
                                                <ContextMenu.Item onclick={() => handleDeleteChannel(privateChannel.id)}>
                                                    Supprimer
                                                </ContextMenu.Item>
                                            </ContextMenu.Content>
                                        </ContextMenu.Root>
                                    </div>
                                {/each}
                            </Sidebar.Menu>
                        </Sidebar.GroupContent>

                    </Sidebar.Group>

                    <Sidebar.Group class="p-0">
                        <Sidebar.GroupContent>
                            <Sidebar.Menu class="flex mx-auto flex-col items-center min-w-64">

                                <Sidebar.MenuItem class="mb-[2px] w-full flex justify-center px-4">
                                    <Sidebar.MenuButton
                                            class="w-full text-sm bg-bl mb-5 bg-[#61A0AF] hover:bg-[#4B7986] text-white py-1.5 rounded transition flex justify-center items-center text-center"
                                            onclick={() => createChannelData.dialogOpen = true}
                                    >
                                        <span class="text-sm font-semibold">Créer un canal</span>
                                        <CreateChannelDialog
                                                {createChannelData}
                                                {createChannel}
                                                workspaceId={currentWorkspaceId}
                                        />
                                    </Sidebar.MenuButton>
                                </Sidebar.MenuItem>
                            </Sidebar.Menu>
                        </Sidebar.GroupContent>
                    </Sidebar.Group>

                </Sidebar.Content>
            </ContextMenu.Trigger>
        </ContextMenu.Root>
    </Sidebar.Root>
</div>

<!-- Example dialog in context menu -->
<Dialog.Root bind:open={dialogOpen.createChannel}>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
            <Dialog.Description>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>