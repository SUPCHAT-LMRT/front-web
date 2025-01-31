let currentOpenedRoomSvelte = $state("");

export const setCurrentOpenedRoom = (roomId) => {
    currentOpenedRoomSvelte = roomId;
}

export const getCurrentOpenedRoom = () => {
    return currentOpenedRoomSvelte;
}