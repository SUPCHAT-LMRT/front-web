<script lang="ts">
    import {page} from "$app/state";
    import ws from "$lib/api/ws";
    import {Input} from "$lib/components/ui/input";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {RoomKind} from "$lib/api/room";
    import * as Avatar from "$lib/components/ui/avatar";
    import {
        type Channel,
        type ChannelMessage,
        getWorkspaceChannel,
        getWorkspaceChannelMessages
    } from "$lib/api/workspaces/channels";
    import {format} from "date-fns";
    import {fr} from "date-fns/locale";
    import {Tooltip, TooltipTrigger, TooltipContent} from "$lib/components/ui/tooltip";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import {formatDate} from "$lib/utils/formatDate";
    import {Pen, Trash2} from "lucide-svelte";
    import {fallbackAvatarLetters} from "$lib/utils/fallbackAvatarLetters.js";
    import {cn} from "$lib/utils";
    import {tick} from "svelte";
    import {scrollToBottom} from "$lib/utils/scrollToBottom";

    const {authenticatedUser} = page.data;

    let currentUserId = authenticatedUser.id;
    let currentWorkspaceId = $derived(page.params.workspaceId);
    let currentChannelId = $derived(page.params.channelId);
    let currentChannel: Channel = $state(null);
    let currentMessage = $state("");
    let currentRoom: { id: string | null; messages: ChannelMessage[] } = $state({id: null, messages: []});
    let unsubscribeSendMessage = null;
    let unsubscribeMessageReactionAdded = null;
    let unsubscribeMessageReactionRemoved = null;
    let inputElement: HTMLDivElement = $state(null);
    let elementsList: HTMLDivElement = $state(null);

    $effect(() => {
        joinRoomAndListenMessages(currentWorkspaceId, currentChannelId);
        getWorkspaceChannel(currentWorkspaceId, currentChannelId).then(channel => currentChannel = channel);

        return () => {
            unsubscribeSendMessage?.();
            unsubscribeMessageReactionAdded?.();
            unsubscribeMessageReactionRemoved?.();
            ws.leaveRoom(currentRoom.id);
            currentRoom.id = null;
            currentRoom.messages = [];
        };
    });

    const joinRoomAndListenMessages = async (workspaceId: string, channelId: string) => {
        try {
            currentRoom.messages = await getWorkspaceChannelMessages(workspaceId, channelId);
            const joinedRoom = await ws.asyncJoinRoom(channelId, RoomKind.CHANNEL);
            currentRoom.id = joinedRoom.id;

            await tick();
            await scrollToBottom(elementsList, "auto");

            unsubscribeSendMessage = ws.subscribe("send-channel-message", async (msg) => {
                currentRoom.messages = [
                    ...currentRoom.messages,
                    {
                        id: msg.messageId,
                        content: msg.content,
                        author: {
                            userId: msg.sender.userId,
                            pseudo: msg.sender.pseudo,
                            workspaceMemberId: msg.sender.workspaceMemberId,
                            workspacePseudo: msg.sender.workspacePseudo,
                        },
                        createdAt: msg.createdAt,
                        reactions: [],
                    },
                ];

                await tick();
                await scrollToBottom(elementsList);
            });

            // Added is triggered when a user adds a reaction to a message,
            // If the reaction already exists, just update the usernames array with the new user, else add the reaction to the message
            unsubscribeMessageReactionAdded = ws.subscribe("channel-message-reaction-added", (msg) => {
                const message = currentRoom.messages.find(m => m.id === msg.messageId);
                if (message) {
                    const reaction = message.reactions.find(r => r.reaction === msg.reaction);
                    if (reaction) {
                        reaction.users = [...reaction.users, {id: msg.member.userId, name: msg.member.username}];
                    } else {
                        message.reactions = [
                            ...message.reactions,
                            {
                                reaction: msg.reaction,
                                users: [{id: msg.member.userId, name: msg.member.username}],
                            },
                        ];
                    }
                }
            });

            // Removed is triggered when a user removes a reaction from a message,
            // If the reaction exists, remove the user from the usernames array, if the usernames array is empty, remove the reaction from the message
            unsubscribeMessageReactionRemoved = ws.subscribe("channel-message-reaction-removed", (msg) => {
                const message = currentRoom.messages.find(m => m.id === msg.messageId);
                if (message) {
                    const reaction = message.reactions.find(r => r.reaction === msg.reaction);
                    if (reaction) {
                        reaction.users = reaction.users.filter(({id}) => id !== msg.member.userId);
                        if (reaction.users.length === 0) {
                            message.reactions = message.reactions.filter(r => r.reaction !== msg.reaction);
                        }
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleMessageReactionToggle = (messageId: string, reaction: string) => {
        ws.toggleChannelMessageReaction(currentRoom.id, messageId, reaction);
    };

    const sendMessageToWs = () => {
        if (currentMessage.trim() === "") return;
        ws.sendChannelMessage(currentRoom.id, currentMessage);
        currentMessage = "";
    };

    // Set the input placeholder if the input is empty
    $effect(() => {
        if (currentMessage.trim() === "" && inputElement) inputElement.innerText = "";
    })

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessageToWs();
        }
    }
</script>

<div class="w-full h-full flex flex-col gap-y-4">
    {#if currentChannel}
        <div class="flex items-center gap-x-2 bg-gray-100 dark:bg-gray-800 p-4">
            <span class="font-semibold text-2xl">#{currentChannel.name}</span>
            <span class="text-gray-500 text-lg translate-y-[1px]">{currentChannel.topic}</span>
        </div>
    {/if}

    <div class="flex-1 overflow-y-auto px-4 space-y-4" bind:this={elementsList}>
        {#if currentRoom.id !== null}
            {#each currentRoom.messages as message (message.id)}
                <ContextMenu.Root>
                    <ContextMenu.Trigger>
                        <div class="flex gap-x-4 items-start"
                             class:justify-end={message.author.userId === currentUserId}>

                            {#snippet messageReaction()}
                                <div class="flex items-center gap-2">
                                    {#each message.reactions as {reaction, users} (reaction)}
                                        <div
                                                class={cn("flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-lg gap-x-2 transition-colors duration-300 select-none", {
                                                    "border-primary border-[1px] !bg-primary/30": users.find(({id}) => id === currentUserId),
                                                })}
                                                onclick={() => handleMessageReactionToggle(message.id, reaction)}
                                                role="button" tabindex="-1">
                                            <span>{reaction}</span>
                                            <span class="tabular-nums">{users.length}</span>
                                        </div>
                                    {/each}
                                </div>
                            {/snippet}

                            {#if message.author !== null && message.author.userId !== currentUserId}
                                <Avatar.Root class="flex-shrink-0">
                                    <Avatar.Image src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)}/>
                                    <Avatar.Fallback>{fallbackAvatarLetters(message.author.workspacePseudo)}</Avatar.Fallback>
                                </Avatar.Root>
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold">{message.author.workspacePseudo}</span>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span class="text-sm text-gray-500">
                                                    {formatDate(message.createdAt)}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {format(new Date(message.createdAt), "EEEE d MMMM yyyy à HH:mm", {locale: fr})}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div class="flex flex-col gap-y-2">
                                        <div class="flex items-center gap-2">
                                            <span class="p-2 rounded-xl break-all bg-primary text-white shadow-lg">
                                                {message.content}
                                            </span>
                                        </div>
                                        {@render messageReaction()}
                                    </div>
                                </div>
                            {/if}

                            {#if message.author.userId === currentUserId}
                                <div class="flex flex-col">
                                    <div class="flex flex-col gap-y-2">
                                        <div class="flex items-end gap-2 justify-end">

                                            <div class="flex flex-col items-end gap-y-2">
                                                <Tooltip>
                                                    <TooltipTrigger class="text-left">
                                                        <span class="text-sm text-gray-500">
                                                            {formatDate(message.createdAt)}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {format(new Date(message.createdAt), "EEEE d MMMM yyyy à HH:mm", {locale: fr})}
                                                    </TooltipContent>
                                                </Tooltip>
                                                <span class="p-2 rounded-xl break-all bg-primary text-white shadow-lg w-full">
                                                    {message.content}
                                                </span>
                                            </div>

                                            <Avatar.Root class="flex-shrink-0 -translate-y-[2px] -p-[2px]">
                                                <Avatar.Image
                                                        src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)}/>
                                                <Avatar.Fallback>{fallbackAvatarLetters(message.author.workspacePseudo)}</Avatar.Fallback>
                                            </Avatar.Root>
                                        </div>

                                        {@render messageReaction()}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content class="w-64">
                        <ContextMenu.Item class="flex justify-between hover:!bg-white">
                            {#each ["😊", "😂", "🤷‍♂️", "👍"] as emoji}
                                <div class="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors duration-300 p-2 rounded-full w-8 h-8 text-lg"
                                     onclick={() => handleMessageReactionToggle(message.id, emoji)}
                                     role="button" tabindex="-1">
                                    {emoji}
                                </div>
                            {/each}
                        </ContextMenu.Item>
                        <ContextMenu.Sub>
                            <ContextMenu.SubTrigger>Ajouter une réaction</ContextMenu.SubTrigger>
                            <ContextMenu.SubContent class="min-w-max">
                                {#each ["😉", "😎", "😢"] as emoji}
                                    <ContextMenu.Item
                                            class="text-lg"
                                            onclick={() => handleMessageReactionToggle(message.id, emoji)}
                                            role="button" tabindex={-1}>
                                        {emoji}
                                    </ContextMenu.Item>
                                {/each}
                            </ContextMenu.SubContent>
                        </ContextMenu.Sub>
                        <ContextMenu.Separator/>
                        <ContextMenu.Item class="flex justify-between">
                            <span>Modifier</span>
                            <div>
                                <Pen size="18"/>
                            </div>
                        </ContextMenu.Item>
                        <ContextMenu.Item class="text-red-500 hover:!bg-red-500 hover:!text-white flex justify-between">
                            <span>Supprimer</span>
                            <div>
                                <Trash2 size="18"/>
                            </div>
                        </ContextMenu.Item>
                    </ContextMenu.Content>
                </ContextMenu.Root>
            {/each}
        {/if}
    </div>

    {#if currentChannel}
        <div class="p-2 border-none border-t-[2px] bg-gray-100 dark:bg-gray-800 border-t-primary max-h-12 overflow-y-auto w-full break-all cursor-text"
             contenteditable
             placeholder="Écrivez un message dans #{currentChannel.name}"
             bind:this={inputElement}
             bind:innerText={currentMessage}
             onkeydown={handleInputKeyDown}
        ></div>
    {/if}
</div>

<style>
    [contenteditable][placeholder]:empty:before {
        content: attr(placeholder);
        position: absolute;
        color: gray;
        background-color: transparent;
        cursor: text;
    }
</style>