<script lang="ts">
    import {page} from "$app/state";
    import ws from "$lib/api/ws";
    import {Input} from "$lib/components/ui/input";
    import {AvatarFallback, AvatarImage} from "$lib/components/ui/avatar";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {RoomKind} from "$lib/api/room";
    import * as Avatar from "$lib/components/ui/avatar";
    import {getGroupMessages, GroupMessage} from "$lib/api/group/message";
    import {getWorkspaceChannelMessages} from "$lib/api/workspaces/channels";

    let currentChatId = $derived(page.params.chatId);
    let currentChatKind: RoomKind = $derived(RoomKind[page.params.chatKind as keyof typeof RoomKind]);
    let currentMessage = $state("");
    let currentRoom: {id: string | null, messages: GroupMessage[]} = $state({id: null, messages: []});
    let unsubscribeSendMessage = null;

    $effect(() => {
        joinRoomAndListenMessages(currentChatId, currentChatKind);

        return () => {
            unsubscribeSendMessage?.();
            ws.leaveRoom(currentRoom.id);
            currentRoom.id = null;
            currentRoom.messages = [];
        }
    })

    const joinRoomAndListenMessages = async (roomId: string, chatKind: RoomKind) => {
        if (chatKind === RoomKind.GROUP) {
            currentRoom.messages = await getGroupMessages(roomId);
        } else {
            // Todo handle direct chat messages
        }

        currentRoom.id = await ws.asyncJoinRoom(roomId, chatKind)

        unsubscribeSendMessage = ws.subscribe("send-message", msg => {
            if (chatKind === RoomKind.GROUP) {
                currentRoom.messages = [...currentRoom.messages, {
                    id: msg.id,
                    content: msg.message,
                    author: {
                        userId: msg.payload.userId,
                        pseudo: msg.payload.pseudo,
                    },
                    createdAt: msg.createdAt
                }];
            } else {
                // Todo handle direct chat messages
            }
        })
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
                    <!-- In case of system message for example -->
                    {#if message.author !== null}
                        <Avatar.Root>
                            <AvatarImage
                                    src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.author.userId)}/>
                            <AvatarFallback>{message.author.pseudo[0]}</AvatarFallback>
                        </Avatar.Root>
                        <span>{message.author.pseudo}</span>
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