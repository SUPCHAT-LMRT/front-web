import {RoomKind} from "./room";

let currentOpenedRoom = {
    id: "",
    kind: RoomKind.UNKNOWN
};

export const setCurrentOpenedRoom = (roomId: string, roomKind: RoomKind) => {
    currentOpenedRoom = {
        id: roomId,
        kind: roomKind
    }
}

export const getCurrentOpenedRoom = (): typeof currentOpenedRoom => {
    return currentOpenedRoom;
}