<script lang="ts">
    let ws: WebSocket = $state();
    let users = $state([]);
    let rooms = $state([]);
    let roomInput = $state("");
    let user: {
        name: ""
    } = $state({name: ""});

    const connect = () => {
        if (user.name !== "") {
            connectToWebsocket(user.name);
        }
    }

    const connectToWebsocket = (name: string) => {
        ws = new WebSocket("ws://localhost:3000/api/ws" + "?name=" + name);
        ws.addEventListener('open', () => {
            onWebsocketOpen()
        });
        ws.addEventListener('message', (event) => {
            handleNewMessage(event)
        });
    }

    const onWebsocketOpen = () => {
        console.log("connected to WS!");
    }


</script>

<style lang="postcss">
    @import 'https://unpkg.com/bootstrap/dist/css/bootstrap.min.css';
    @import 'https://unpkg.com/bootstrap-vue@latest/dist/bootstrap-vue.min.css';
</style>

<div class="container h-100">
    <div class="row justify-content-center h-100">
        {#if !ws}
            <div class="col-12 form">
                <div class="input-group">
                    <input bind:value={user.name} class="form-control name" placeholder="Please fill in your (nick)name"
                           onkeyup={e => e.key === 'Enter' && connect()}/>
                    <div class="input-group-append">
                        <span class="input-group-text send_btn" onclick={connect}>Connect</span>
                    </div>
                </div>
            </div>
        {/if}
        <div class="col-12">
            <div class="row">
                {#each users as user (user.id)}
                    <div class="col-2 card profile">
                        <div class="card-header">{user.name}</div>
                        <div class="card-body">
                            <button class="btn btn-primary" onclick={() => joinPrivateRoom(user)}>Send Message</button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        {#if ws}
            <div class="col-12 room">
                <div class="input-group">
                    <input bind:value={roomInput} class="form-control name" placeholder="Type the room you want to join"
                           onkeyup={e => e.key === 'Enter' && joinRoom()}/>
                    <div class="input-group-append">
                        <span class="input-group-text send_btn" onclick={joinRoom}>Join</span>
                    </div>
                </div>
            </div>
        {/if}
        {#each Object.values(rooms) as room (room.name)}
            <div class="chat">
                <div class="card">
                    <div class="card-header msg_head">
                        <div class="d-flex bd-highlight justify-content-center">
                            {room.name}
                            <span class="card-close" onclick={() => leaveRoom(room)}>leave</span>
                        </div>
                    </div>
                    <div class="card-body msg_card_body">
                        {#each room.messages as message (message.id)}
                            <div class="d-flex justify-content-start mb-4">
                                <div class="msg_cotainer">
                                    {message.message}
                                    {#if message.sender}
                                        <span class="msg_name">{message.sender.name}</span>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div class="card-footer">
                        <div class="input-group">
                            <textarea bind:value={room.newMessage} class="form-control type_msg"
                                      placeholder="Type your message..."
                                      onkeyup={e => e.key === 'Enter' && sendMessage(room)}></textarea>
                            <div class="input-group-append">
                                <span class="input-group-text send_btn"
                                      onclick={() => sendMessage(room)}>Send message</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>