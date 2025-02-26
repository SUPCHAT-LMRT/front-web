<script lang="ts">
    import {page} from "$app/state";
    import ws from "$lib/api/ws";
    import {Input} from "$lib/components/ui/input";
    import {AvatarFallback, AvatarImage} from "$lib/components/ui/avatar";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {RoomKind} from "$lib/api/room";
    import * as Avatar from "$lib/components/ui/avatar";
    import {type ChannelMessage, getWorkspaceChannelMessages} from "$lib/api/workspaces/channels";
    import {onMount} from "svelte";
    import {format, isToday, isYesterday} from "date-fns";
    import {fr} from "date-fns/locale";
    import {Tooltip, TooltipTrigger, TooltipContent} from "$lib/components/ui/tooltip";
    import * as ContextMenu from "$lib/components/ui/context-menu";

    const {authenticatedUser} = page.data;

    let currentUserId = authenticatedUser.id;
    let currentWorkspaceId = $derived(page.params.workspaceId);
    let currentChannelId = $derived(page.params.channelId);
    let currentMessage = $state("");
    let currentRoom: { id: string | null; messages: ChannelMessage[] } = $state({id: null, messages: []});
    let unsubscribeSendMessage = null;
    let unsubscribeMessageReactionCreate = null;

    $effect(() => {
        joinRoomAndListenMessages(currentWorkspaceId, currentChannelId);

        return () => {
            unsubscribeSendMessage?.();
            unsubscribeMessageReactionCreate?.();
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

            unsubscribeSendMessage = ws.subscribe("send-channel-message", (msg) => {
                currentRoom.messages = [
                    ...currentRoom.messages,
                    {
                        id: msg.id,
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
            });

            unsubscribeMessageReactionCreate = ws.subscribe("channel-message-reaction-create", (msg) => {
                const messageIndex = currentRoom.messages.findIndex(m => m.id === msg.messageId);
                if (messageIndex !== -1) {
                    currentRoom.messages[messageIndex].reactions = [...currentRoom.messages[messageIndex].reactions, {
                        id: msg.reactionId,
                        userId: msg.member.userId,
                        reaction: msg.reaction,
                    }];
                }
            })
        } catch (e) {
            console.error(e);
        }
    };

    const handleMessageReactionCreate = (messageId: string, reaction: string) => {
        ws.createChannelMessageReaction(currentRoom.id, messageId, reaction);
    };

    const sendMessageToWs = () => {
        ws.sendChannelMessage(currentRoom.id, currentMessage);
        currentMessage = "";
    };
</script>

<div class="w-full h-full flex flex-col text-[18px]">
    {#if currentRoom.id !== null}
        <div class="flex-1 overflow-y-auto px-4 mt-4 space-y-4">
            {#each currentRoom.messages as message (message.id)}
                <ContextMenu.Root>
                    <ContextMenu.Trigger>
                        <div class="flex gap-x-4 items-start"
                             class:justify-end={message.author.userId === currentUserId}>
                            {#if message.author !== null && message.author.userId !== currentUserId}
                                <Avatar.Root class="flex-shrink-0">
                                    <AvatarImage src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)}/>
                                    <AvatarFallback>{message.author.workspacePseudo[0]}</AvatarFallback>
                                </Avatar.Root>
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold">{message.author.workspacePseudo}</span>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span class="text-sm text-gray-500">
                                                    {isToday(new Date(message.createdAt))
                                                        ? format(new Date(message.createdAt), "HH:mm")
                                                        : isYesterday(new Date(message.createdAt))
                                                            ? "Hier"
                                                            : format(new Date(message.createdAt), "dd/MM/yyyy")}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {format(new Date(message.createdAt), "EEEE d MMMM yyyy à HH:mm", {locale: fr})}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            {/if}
                            {#if message.author.userId === currentUserId}
                                <div class="flex flex-col items-end">
                                    <Tooltip>
                                        <TooltipTrigger>
                                        <span class="text-sm text-gray-500">
                                            {isToday(new Date(message.createdAt))
                                                ? format(new Date(message.createdAt), "HH:mm")
                                                : isYesterday(new Date(message.createdAt))
                                                    ? "Hier"
                                                    : format(new Date(message.createdAt), "dd/MM/yyyy")}
                                        </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {format(new Date(message.createdAt), "EEEE d MMMM yyyy à HH:mm", {locale: fr})}
                                        </TooltipContent>
                                    </Tooltip>
                                    <div class="flex items-center gap-2 ml-auto">
                                        <span class="p-2 rounded-xl max-w-xs bg-primary text-white shadow-lg">
                                            {message.content}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        {#each message.reactions as reaction (reaction.id)}
                                            <div class="flex items-center justify-center bg-gray-100 p-2 rounded-full w-8 h-8 text-lg">
                                                {reaction.reaction}
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content class="w-64">
                        <ContextMenu.Item class="flex justify-between">
                            {#each [":)", ":/", ":(", ":("] as reaction}
                                <div class="flex items-center justify-center bg-gray-100 p-2 rounded-full w-8 h-8 text-lg"
                                     onclick={() => handleMessageReactionCreate(message.id, reaction)}
                                     onkeydown={() => handleMessageReactionCreate(message.id, reaction)}
                                     role="button" tabindex="-1">
                                    {reaction}
                                </div>
                            {/each}
                        </ContextMenu.Item>
                        <ContextMenu.Sub>
                            <ContextMenu.SubTrigger>Ajouter une réaction</ContextMenu.SubTrigger>
                            <ContextMenu.SubContent class="w-48">
                                <ContextMenu.Item>:)</ContextMenu.Item>
                                <ContextMenu.Item>:/</ContextMenu.Item>
                                <ContextMenu.Item>:(</ContextMenu.Item>
                            </ContextMenu.SubContent>
                        </ContextMenu.Sub>
                        <ContextMenu.Separator/>
                        <ContextMenu.Item>Billing</ContextMenu.Item>
                        <ContextMenu.Item>Team</ContextMenu.Item>
                        <ContextMenu.Item>Subscription</ContextMenu.Item>
                    </ContextMenu.Content>
                </ContextMenu.Root>
            {/each}
        </div>

        <div class="p-2 border-t">
            <Input placeholder="Enter your message" bind:value={currentMessage}
                   onkeyup={e => e.key === 'Enter' && sendMessageToWs()}/>
        </div>
    {/if}
</div>
