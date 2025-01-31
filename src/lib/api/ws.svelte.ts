import {getCurrentOpenedRoom, setCurrentOpenedRoom} from "./currentOpenedRoom.svelte";

let ws: WebSocket = $state(null);
let rooms = $state([]);
let users = $state([]);
let subscribers = [];

export const connectToWebsocket = () => {
    ws = new WebSocket("ws://localhost:3000/api/ws");
    ws.addEventListener('open', () => {
        console.log("connected to WS!");
    });
    ws.addEventListener('message', (event) => {
        handleNewMessage(event)
    });
}

const handleNewMessage = (event) => {
    let data = event.data;
    data = data.split(/\r?\n/);

    for (let i = 0; i < data.length; i++) {
        const msg = JSON.parse(data[i]);
        switch (msg.action) {
            case "send-message":
                handleChatMessage(msg);
                break;
            case "user-connect":
                handleUserJoined(msg);
                break;
            case "user-disconnect":
                handleUserLeft(msg);
                break;
            case "room-joined":
                handleRoomJoined(msg);
                break;
            default:
                break;
        }

        subscribers.forEach(subscriber => {
            subscriber.callback(msg);
        });
    }
}

const handleChatMessage = (msg) => {
    const room = findRoom(msg.target.id);
    if (typeof room !== "undefined") {
        room.messages = [...room.messages, msg];
    }
}

const handleUserJoined = (msg) => {
    users = [...users, msg.sender];
}
const handleUserLeft = (msg) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == msg.sender.id) {
            users.splice(i, 1);
        }
    }
}

const handleRoomJoined = (msg) => {
    const room = msg.target;
    room.name = room.private ? msg.sender.name : room.name;
    room["messages"] = [];
    rooms = [...rooms, room];
    setCurrentOpenedRoom(room.id);
}

export const sendMessage = (room, message) => {
    ws.send(JSON.stringify({
        action: 'send-message',
        message: message,
        target: {
            id: room.id,
            name: room.name
        }
    }));
}

export const findRoom = (roomId) => {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id === roomId) {
            return rooms[i];
        }
    }
}

export const joinRoom = (roomId: string) => {
    const currentOpenedRoom = getCurrentOpenedRoom();
    if (currentOpenedRoom !== "") {
        leaveRoom(findRoom(currentOpenedRoom));
    }

    ws.send(JSON.stringify({action: 'join-room', message: roomId}));
}

export const asyncJoinRoom = async (roomId: string) => {
    return new Promise((resolve) => {
        joinRoom(roomId);
        const unsubscribe = subscribe("room-joined", (msg) => {
            resolve(msg.target);
            unsubscribe();
        });
    })
}

export const subscribe = (action: string, callback: (msg) => void): () => void => {
    const subscriptionId = self.crypto.randomUUID();
    subscribers = [...subscribers, {
        subscriptionId,
        callback: (msg) => {
            if (msg.action === action) {
                callback(msg);
            }
        }
    }];

    return () => unsubscribe(subscriptionId);
}

export const unsubscribe = (subscriptionId: string) => {
    for (let i = 0; i < subscribers.length; i++) {
        if (subscribers[i].subscriptionId === subscriptionId) {
            subscribers.splice(i, 1);
            break;
        }
    }
}

export const leaveRoom = (room) => {
    ws.send(JSON.stringify({action: 'leave-room', message: room.id}));

    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id === room.id) {
            rooms.splice(i, 1);
            break;
        }
    }
}

export const getConnectedUsers = () => {
    return users;
}

const joinPrivateRoom = (room) => {
    ws.send(JSON.stringify({action: 'join-room-private', message: room.id}));
}