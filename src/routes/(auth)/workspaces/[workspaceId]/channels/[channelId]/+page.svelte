<script lang="ts">
    import {page} from "$app/state";
    import ws from "$lib/api/ws";
    import {Input} from "$lib/components/ui/input";
    import {AvatarFallback, AvatarImage} from "$lib/components/ui/avatar";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {RoomKind} from "$lib/api/room";
    import * as Avatar from "$lib/components/ui/avatar";
    import {type ChannelMessage, getWorkspaceChannelMessages} from "$lib/api/workspaces/channels";

    let currentWorkspaceId = $derived(page.params.workspaceId);
    let currentChannelId = $derived(page.params.channelId);
    let currentMessage = $state("");
    let currentRoom: {id: string | null, messages: ChannelMessage[]} = $state({id: null, messages: []});
    let unsubscribeSendMessage = null;

    $effect(() => {
        joinRoomAndListenMessages(currentWorkspaceId, currentChannelId);

        return () => {
            unsubscribeSendMessage?.();
            ws.leaveRoom(currentRoom.id);
            currentRoom.id = null;
            currentRoom.messages = [];
        }
    })

    const joinRoomAndListenMessages = async (workspaceId: string, channelId: string) => {
        try {
            currentRoom.messages = await getWorkspaceChannelMessages(workspaceId, channelId);

            currentRoom.id = await ws.asyncJoinRoom(channelId, RoomKind.CHANNEL);

            unsubscribeSendMessage = ws.subscribe("send-message", msg => {
                currentRoom.messages = [...currentRoom.messages, {
                    id: msg.id,
                    content: msg.message,
                    author: {
                        userId: msg.payload.userId,
                        pseudo: msg.payload.pseudo,
                        workspaceMemberId: msg.payload.workspaceMemberId,
                        workspacePseudo: msg.payload.workspacePseudo
                    },
                    createdAt: msg.createdAt
                }];
            })
        } catch (e) {
            console.error(e);
        }
    }

    const sendMessageToWs = () => {
        ws.sendMessage(currentRoom.id, currentMessage)
        currentMessage = "";
    }
</script>

<div class="w-full h-full flex flex-col">
    {#if currentRoom.id !== null}
        <div class="flex-1 overflow-y-auto px-4 mt-4 space-y-4">
            {#each currentRoom.messages as message (message.id)}
                <div class="flex gap-x-4 items-center">
                    {#if message.author !== null}
                        <Avatar.Root>
                            <AvatarImage
                                    src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)}/>
                            <AvatarFallback>{message.author.workspacePseudo[0]}</AvatarFallback>
                        </Avatar.Root>
                        <span>{message.author.workspacePseudo}</span>
                    {/if}
                    <span>{message.content}</span>
                </div>
            {/each}
        </div>

        <div class="p-2 border-t">
            <Input placeholder="Enter your message" bind:value={currentMessage}
                   onkeyup={e => e.key === 'Enter' && sendMessageToWs()}/>
        </div>
    {/if}
</div>
