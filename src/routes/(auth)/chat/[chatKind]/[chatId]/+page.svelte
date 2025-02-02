<script lang="ts">
    import {page} from "$app/state";
    import {asyncJoinRoom, sendMessage, subscribe} from "$lib/api/ws.svelte.js";
    import {Input} from "$lib/components/ui/input";
    import {AvatarFallback, AvatarImage} from "$lib/components/ui/avatar";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";
    import {RoomKind} from "$lib/api/room";
    import * as Avatar from "$lib/components/ui/avatar";

    let currentChatId = $state("");
    let currentChatKind: RoomKind = $state(RoomKind.UNKNOWN);
    let currentMessage = $state("");
    let currentRoom = $state(null);

    $effect(() => {
        currentChatId = page.params.chatId;
        currentChatKind = RoomKind[page.params.chatKind as keyof typeof RoomKind];
        let unsubscribeSendMessage = null;

        setTimeout(async () => {
            currentRoom = await asyncJoinRoom(currentChatId, currentChatKind)

            unsubscribeSendMessage = subscribe("send-message", msg => {
                currentRoom.messages = [...currentRoom.messages, msg];
            })
        }, 300)

        return () => {
            unsubscribeSendMessage?.();
        }
    })

    const sendMessageToWs = () => {
        sendMessage(currentRoom, currentMessage)
        currentMessage = "";
    }
</script>

<div class="w-full">
    <div>
        Room:
        {#if currentRoom}
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