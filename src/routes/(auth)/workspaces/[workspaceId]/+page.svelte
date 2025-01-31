<script lang="ts">
    import {page} from "$app/state";
    import {asyncJoinRoom, getConnectedUsers, sendMessage, subscribe} from "$lib/api/ws.svelte";
    import {Input} from "$lib/components/ui/input";
    import * as Avatar from "$lib/components/ui/avatar";
    import {AvatarFallback, AvatarImage} from "$lib/components/ui/avatar/index.js";
    import {getS3ObjectUrl, S3Bucket} from "$lib/api/s3";

    let currentWorkspaceId = $state("");
    let currentMessage = $state("");
    let currentRoom = $state(null);
    let allUsersConnected = $state(getConnectedUsers());

    $effect(() => {
        currentWorkspaceId = page.params.workspaceId;
        let unsubscribeSendMessage = null;
        let unsubscribeUserConnect = null;
        let unsubscribeUserDisconnect = null;

        // user-connect can happen before the room is joined
        unsubscribeUserConnect = subscribe("user-connect", msg => {
            allUsersConnected = [...allUsersConnected, msg.sender];
        })

        // user-disconnect can happen before the room is joined
        unsubscribeUserDisconnect = subscribe("user-disconnect", msg => {
            allUsersConnected = allUsersConnected.filter(user => user.userId !== msg.sender.userId);
        })

        setTimeout(async () => {
            currentRoom = await asyncJoinRoom(currentWorkspaceId);

            unsubscribeSendMessage = subscribe("send-message", msg => {
                currentRoom.messages = [...currentRoom.messages, msg];
            })
        }, 300)

        return () => {
            unsubscribeSendMessage();
            unsubscribeUserConnect();
            unsubscribeUserDisconnect();
        }
    })

    const sendMessageToWs = () => {
        sendMessage(currentRoom, currentMessage)
        currentMessage = "";
    }
</script>

<div class="w-full">
    <div>
        Tous les utilisateurs connectés:
        {#each allUsersConnected as user (user.id)}
            {user.userId}
        {/each}
    </div>

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
                                <AvatarFallback>{message.messageSender.workspacePseudo[0]}</AvatarFallback>
                            </Avatar.Root>
                            <span>{message.messageSender.workspacePseudo}</span>
                        {/if}
                        <span>{message.message}</span>
                    </div>
                {/each}
            </div>

        {/if}
    </div>
</div>