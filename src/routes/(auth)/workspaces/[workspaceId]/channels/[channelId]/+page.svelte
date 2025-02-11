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

    $effect(() => {
        joinRoomAndListenMessages(currentWorkspaceId, currentChannelId);
        return () => {
            unsubscribeSendMessage?.();
            ws.leaveRoom(currentRoom.id);
            currentRoom.id = null;
            currentRoom.messages = [];
        };
    });

    const joinRoomAndListenMessages = async (workspaceId: string, channelId: string) => {
        try {
            currentRoom.messages = await getWorkspaceChannelMessages(workspaceId, channelId);
            currentRoom.id = await ws.asyncJoinRoom(channelId, RoomKind.CHANNEL);

            unsubscribeSendMessage = ws.subscribe("send-message", (msg) => {
                currentRoom.messages = [
                    ...currentRoom.messages,
                    {
                        id: msg.id,
                        content: msg.message,
                        author: {
                            userId: msg.payload.userId,
                            pseudo: msg.payload.pseudo,
                            workspaceMemberId: msg.payload.workspaceMemberId,
                            workspacePseudo: msg.payload.workspacePseudo,
                        },
                        createdAt: msg.createdAt,
                    },
                ];
            });
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessageToWs = () => {
        ws.sendMessage(currentRoom.id, currentMessage);
        currentMessage = "";
    };
</script>

<div class="w-full h-full flex flex-col text-[18px]">
    {#if currentRoom.id !== null}
        <div class="flex-1 overflow-y-auto px-4 mt-4 space-y-4">
            {#each currentRoom.messages as message (message.id)}
                <div class="flex gap-x-4 items-start" class:justify-end={message.author.userId === currentUserId}>
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
                            <ContextMenu.Root>
                                <ContextMenu.Trigger class="pt-2">
                            <span class="p-2 rounded-xl max-w-xs bg-primary text-white shadow-lg">
                                {message.content}
                            </span>
                                </ContextMenu.Trigger>
                                <ContextMenu.Content>
                                    <ContextMenu.Item>Répondre</ContextMenu.Item>
                                    <ContextMenu.Item>Réagir</ContextMenu.Item>
                                </ContextMenu.Content>
                            </ContextMenu.Root>
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
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <div class="p-2 border-t">
            <Input placeholder="Enter your message" bind:value={currentMessage}
                   onkeyup={e => e.key === 'Enter' && sendMessageToWs()}/>
        </div>
    {/if}
</div>
