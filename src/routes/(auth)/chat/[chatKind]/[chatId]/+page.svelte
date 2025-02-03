<script lang="ts">
    import {page} from "$app/state";
    import ws from "$lib/api/ws";
    import {Input} from "$lib/components/ui/input";
    import {AvatarFallback, AvatarImage} from "$lib/components/ui/avatar";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {RoomKind} from "$lib/api/room";
    import * as Avatar from "$lib/components/ui/avatar";

    let currentChatId = $derived(page.params.chatId);
    let currentChatKind: RoomKind = $derived(RoomKind[page.params.chatKind as keyof typeof RoomKind]);
    let currentMessage = $state("");
    let currentRoom = $state({id: null, messages: []});
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
        currentRoom.id = await ws.asyncJoinRoom(roomId, chatKind)

        unsubscribeSendMessage = ws.subscribe("send-message", msg => {
            currentRoom.messages = [...currentRoom.messages, msg];
        })
    }

    const sendMessageToWs = () => {
        ws.sendMessage(currentRoom.id, currentMessage)
        currentMessage = "";
    }
</script>

<div class="w-full">
    <div>
        Room:
        {#if currentRoom.id !== null}
            <span>{currentRoom.id}</span>

            <Input placeholder="Enter your message" bind:value={currentMessage}
                   onkeyup={e => e.key === 'Enter' && sendMessageToWs()}/>

            <div class="flex flex-col gap-y-4 mt-4">
                {#each currentRoom.messages as message (message.id)}
                    <div class="flex gap-x-4 items-center">
                        <!-- In case of system message for example -->
                        {#if message.messageSender !== null}
                            <Avatar.Root>
                                <AvatarImage
                                        src={getS3ObjectUrl(S3Bucket.USERS_AVATARS, message.messageSender.userId)}/>
                                <AvatarFallback>{message.messageSender.pseudo[0]}</AvatarFallback>
                            </Avatar.Root>
                            <span>{message.messageSender.pseudo}</span>
                        {/if}
                        <span>{message.message}</span>
                    </div>
                {/each}
            </div>

        {/if}
    </div>
</div>