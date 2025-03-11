import {
  getCurrentOpenedRoom,
  setCurrentOpenedRoom,
} from "./currentOpenedRoom.js";
import { RoomKind } from "./room";
import { env } from "$env/dynamic/public";
import {
  getCurrentSelectedWorkspace,
  setCurrentSelectedWorkspace,
} from "$lib/api/currentSelectedWorkspace";
import { refreshAccessToken } from "$lib/api/user";

class Ws {
  private subscribers = [];
  private ws: WebSocket;
  private messageQueue = [];
  private connectionCrashed = false;

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket = async () => {
    await refreshAccessToken();
    this.ws = new WebSocket(env.PUBLIC_API_WS);

    this.ws.onopen = () => {
      console.log("WebSocket connected");

      if (this.connectionCrashed) {
        console.log("WebSocket connection restored, rejoining room...");
        const currentOpenedRoom = getCurrentOpenedRoom();
        if (currentOpenedRoom?.id !== "") {
          this.joinRoom(currentOpenedRoom.id, currentOpenedRoom.kind);
        }
        const currentSelectedWorkspace = getCurrentSelectedWorkspace();
        if (currentSelectedWorkspace !== "") {
          this.selectWorkspace(currentSelectedWorkspace);
        }
        this.connectionCrashed = false;
      }

      // Send any queued messages
      while (this.messageQueue.length > 0) {
        this.ws.send(this.messageQueue.shift());
      }
    };

    this.ws.onclose = (event) => {
      this.connectionCrashed = true;
      console.log("WebSocket closed, retrying...", event);
      setTimeout(() => this.initWebSocket(), 1000); // Retry after 1s
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onmessage = (event) => {
      this.handleNewMessage(event);
    };
  };

  public send = (message) => {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else if (this.ws.readyState === WebSocket.CONNECTING) {
      console.log(
        `WebSocket still connecting, queuing message ${message.action}...`,
      );
      this.messageQueue.push(message);
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

      this.subscribers.forEach((subscriber) => {
        subscriber.callback(msg);
      });
    }
  };

  private handleRoomJoined = ({
    room,
  }: {
    room: { id: string; kind: RoomKind };
  }) => {
    setCurrentOpenedRoom(room.id, this.mapRoomKind(room.kind));
  };

  public sendChannelMessage = (roomId, message) => {
    this.send(
      JSON.stringify({
        action: "send-channel-message",
        content: message,
        channelId: roomId,
      }),
    );
  };

  public sendDirectMessage = (otherUserId, message) => {
    this.send(
      JSON.stringify({
        action: "send-direct-message",
        content: message,
        otherUserId,
      }),
    );
  }

  public joinRoom = (roomId: string, roomKind: RoomKind) => {
    const currentOpenedRoom = getCurrentOpenedRoom();
    if (currentOpenedRoom.id !== "") {
      this.leaveRoom(currentOpenedRoom.id);
    }

    switch (roomKind) {
      case RoomKind.DIRECT:
        this.send(
          JSON.stringify({ action: "join-direct-room", otherUserId: roomId }),
        );
        break;
      case RoomKind.GROUP:
        this.send(
          // TODO handle group rooms
          JSON.stringify({ action: "join-group-room", message: roomId }),
        );
        break;
      case RoomKind.CHANNEL:
        this.send(
          JSON.stringify({ action: "join-channel-room", channelId: roomId }),
        );
        break;
      default:
        throw new Error("Invalid room kind " + roomKind);
    }
  };

  public asyncJoinRoom = async (
    roomId: string,
    roomKind: RoomKind,
  ): Promise<{ id: string; kind: RoomKind }> => {
    return new Promise<{ id: string; kind: RoomKind }>((resolve) => {
      const unsubscribe = this.subscribe("room-joined", (msg) => {
        resolve(msg.room);
        unsubscribe();
      });

      this.joinRoom(roomId, roomKind);
    });
  };

  public selectWorkspace = (workspaceId) => {
    const currentSelectedWorkspace = getCurrentSelectedWorkspace();
    if (currentSelectedWorkspace) {
      this.unselectWorkspace();
    }
    setCurrentSelectedWorkspace(workspaceId);
    this.send(
      JSON.stringify({ action: "select-workspace", workspaceId: workspaceId }),
    );
  };

  public unselectWorkspace = () => {
    if (getCurrentSelectedWorkspace() === "") {
      return;
    }
    setCurrentSelectedWorkspace("");
    this.send(JSON.stringify({ action: "unselect-workspace" }));
  };

  public leaveRoom = (roomId) => {
    setCurrentOpenedRoom("", RoomKind.UNKNOWN);
    this.send(JSON.stringify({ action: "leave-room", roomId: roomId }));
  };

  public toggleChannelMessageReaction = (
    roomId: string,
    messageId: string,
    reaction: string,
  ) => {
    this.send(
      JSON.stringify({
        action: "channel-message-reaction-toggle",
        roomId,
        messageId,
        reaction,
      }),
    );
  };

  public subscribe = (
    action: string,
    callback: (msg) => void,
  ): (() => void) => {
    const subscriptionId = self.crypto.randomUUID();
    this.subscribers = [
      ...this.subscribers,
      {
        subscriptionId,
        callback: (msg) => {
          if (msg.action === action) {
            callback(msg);
          }
        },
      },
    ];

    return () => this.unsubscribe(subscriptionId);
  };

  public unsubscribe = (subscriptionId: string) => {
    for (let i = 0; i < this.subscribers.length; i++) {
      if (this.subscribers[i].subscriptionId === subscriptionId) {
        this.subscribers.splice(i, 1);
        break;
      }
    }
  };

  private mapRoomKind = (roomKind: string): RoomKind => {
    switch (roomKind) {
      case "direct":
        return RoomKind.DIRECT;
      case "group":
        return RoomKind.GROUP;
      case "channel":
        return RoomKind.CHANNEL;
      default:
        return RoomKind.UNKNOWN;
    }
  };
}

export default new Ws();
