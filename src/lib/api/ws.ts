import {getCurrentOpenedRoom, setCurrentOpenedRoom} from "./currentOpenedRoom.js";
import {RoomKind} from "./room";
import { env } from '$env/dynamic/public';

class Ws {
    private subscribers = [];
    private ws: WebSocket;
    private messageQueue = [];

    constructor() {
        this.initWebSocket();
    }

    private initWebSocket = () => {
        this.ws = new WebSocket(env.PUBLIC_API_WS_ORIGIN);

        this.ws.onopen = () => {
            console.log("WebSocket connected");
            // Send any queued messages
            while (this.messageQueue.length > 0) {
                this.ws.send(this.messageQueue.shift());
            }
        };

        this.ws.onclose = (event) => {
            console.log("WebSocket closed, retrying...", event);
            setTimeout(() => this.initWebSocket(), 1000); // Retry after 1s
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.ws.onmessage = (event) => {
            this.handleNewMessage(event)
        }
    }

    public send = (message) => {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else if (this.ws.readyState === WebSocket.CONNECTING) {
            console.log("WebSocket still connecting, queuing message...");
            this.messageQueue.push(message);
            setTimeout(() => this.send(message), 500); // Fixed: Call this.send instead of sendMessage
        } else {
            console.log("WebSocket not connected, discarding message.");
        }
    };

    private handleNewMessage = (event) => {
        let data = event.data;
        data = data.split(/\r?\n/);

        for (let i = 0; i < data.length; i++) {
            const msg = JSON.parse(data[i]);
            switch (msg.action) {
                case "room-joined":
                    this.handleRoomJoined(msg);
                    break;
                default:
                    break;
            }

            this.subscribers.forEach(subscriber => {
                subscriber.callback(msg);
            });
        }
    }

    private handleRoomJoined = (msg) => {
        const room = msg.target;
        setCurrentOpenedRoom(room.id);
    }

    public sendMessage = (roomId, message) => {
        this.send(JSON.stringify({
            action: 'send-message',
            message: message,
            target: {
                id: roomId,
            }
        }));
    }

    public joinRoom = (roomId: string, roomKind: RoomKind) => {
        const currentOpenedRoom = getCurrentOpenedRoom();
        if (currentOpenedRoom !== "") {
            this.leaveRoom(currentOpenedRoom);
        }

        let action: string;
        switch (roomKind) {
            case RoomKind.DIRECT:
                action = "join-direct-room";
                break;
            case RoomKind.GROUP:
                action = "join-group-room";
                break;
            case RoomKind.CHANNEL:
                action = "join-channel-room";
                break;
            default:
                throw new Error("Invalid room kind");
        }

        this.send(JSON.stringify({action: action, message: roomId}));
    }

    public asyncJoinRoom = async (roomId: string, roomKind: RoomKind) => {
        return new Promise((resolve) => {
            this.joinRoom(roomId, roomKind);

            const unsubscribe = this.subscribe("room-joined", (msg) => {
                resolve(msg.target.id);
                unsubscribe();
            });
        })
    }

    public subscribe = (action: string, callback: (msg) => void): () => void => {
        const subscriptionId = self.crypto.randomUUID();
        this.subscribers = [...this.subscribers, {
            subscriptionId,
            callback: (msg) => {
                if (msg.action === action) {
                    callback(msg);
                }
            }
        }];

        return () => this.unsubscribe(subscriptionId);
    }

    public unsubscribe = (subscriptionId: string) => {
        for (let i = 0; i < this.subscribers.length; i++) {
            if (this.subscribers[i].subscriptionId === subscriptionId) {
                this.subscribers.splice(i, 1);
                break;
            }
        }
    }

    public leaveRoom = (roomId) => {
        setCurrentOpenedRoom("");
        this.send(JSON.stringify({action: 'leave-room', message: roomId}));
    }
}

export default new Ws();
