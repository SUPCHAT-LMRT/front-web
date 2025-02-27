<script lang="ts">
    import {page} from "$app/state";
    import ws from "$lib/api/ws";
    import {Input} from "$lib/components/ui/input";
    import {AvatarFallback, AvatarImage} from "$lib/components/ui/avatar";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {RoomKind} from "$lib/api/room";
    import * as Avatar from "$lib/components/ui/avatar";
    import {type ChannelMessage, getWorkspaceChannelMessages} from "$lib/api/workspaces/channels";
    import {format, isToday, isYesterday} from "date-fns";
    import {fr} from "date-fns/locale";
    import {Tooltip, TooltipTrigger, TooltipContent} from "$lib/components/ui/tooltip";
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import {formatDate} from "$lib/utils/formatDate";
    import {Pen, Trash2} from "lucide-svelte";
    import {scale} from "svelte/transition";

    const {authenticatedUser} = page.data;

    let currentUserId = authenticatedUser.id;
    let currentWorkspaceId = $derived(page.params.workspaceId);
    let currentChannelId = $derived(page.params.channelId);
    let currentMessage = $state("");
    let currentRoom: { id: string | null; messages: ChannelMessage[] } = $state({id: null, messages: []});
    let unsubscribeSendMessage = null;
    let unsubscribeMessageReactionAdded = null;
    let unsubscribeMessageReactionRemoved = null;

    $effect(() => {
        joinRoomAndListenMessages(currentWorkspaceId, currentChannelId);

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
        ws.sendChannelMessage(currentRoom.id, currentMessage);
        currentMessage = "";
    };
</script>

<div class="w-full h-full flex flex-col text-[18px]">
    {#if currentRoom.id !== null}
        <div class="flex-1 overflow-y-auto px-4 space-y-4">
            {#each currentRoom.messages as message (message.id)}
                <ContextMenu.Root>
                    <ContextMenu.Trigger>
                        <div class="flex gap-x-4 items-start"
                             class:justify-end={message.author.userId === currentUserId}>

                            {#snippet messageReaction()}
                                <div class="flex items-center gap-2">
                                    {#each message.reactions as {reaction, users} (reaction)}
                                        <div class="flex items-center justify-center bg-gray-100 p-1 rounded-lg text-lg gap-x-2 transition-colors duration-300 select-none"
                                             class:bg-yellow-300={users.find(({id}) => id === currentUserId)}
                                             transition:scale={{duration: 50}}
                                             onclick={() => handleMessageReactionToggle(message.id, reaction)}
                                             onkeydown={() => handleMessageReactionToggle(message.id, reaction)}
                                             role="button" tabindex="-1"
                                        >
                                            <span>{reaction}</span>
                                            <span>{users.length}</span>
                                        </div>
                                    {/each}
                                </div>
                            {/snippet}

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
                                            <span class="p-2 rounded-xl max-w-xs bg-primary text-white shadow-lg">
                                                {message.content}
                                            </span>
                                        </div>
                                        {@render messageReaction()}
                                    </div>
                                </div>
                            {/if}

                            {#if message.author.userId === currentUserId}
                                <div class="flex flex-col">
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
                                    <div class="flex flex-col gap-y-2">
                                        <div class="flex items-center gap-2">
                                            <span class="p-2 rounded-xl max-w-xs bg-primary text-white shadow-lg">
                                                {message.content}
                                            </span>

                                            <Avatar.Root class="flex-shrink-0">
                                                <AvatarImage
                                                        src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)}/>
                                                <AvatarFallback>{message.author.workspacePseudo[0]}</AvatarFallback>
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
                            {#each ["😊", "😂", "🤷‍♂️", "👍"] as reaction}
                                <div class="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors duration-300 p-2 rounded-full w-8 h-8 text-lg"
                                     onclick={() => handleMessageReactionToggle(message.id, reaction)}
                                     onkeydown={() => handleMessageReactionToggle(message.id, reaction)}
                                     role="button" tabindex="-1">
                                    {reaction}
                                </div>
                            {/each}
                        </ContextMenu.Item>
                        <ContextMenu.Sub>
                            <ContextMenu.SubTrigger>Ajouter une réaction</ContextMenu.SubTrigger>
                            <ContextMenu.SubContent class="min-w-max">
                                <ContextMenu.Item class="text-lg">😉</ContextMenu.Item>
                                <ContextMenu.Item class="text-lg">😎</ContextMenu.Item>
                                <ContextMenu.Item class="text-lg">😢</ContextMenu.Item>
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
        </div>

        <div class="p-2 border-t">
            <Input placeholder="Enter your message" bind:value={currentMessage}
                   onkeyup={e => e.key === 'Enter' && sendMessageToWs()}/>
        </div>
    {/if}
</div>
