let currentOpenedRoom = "";

export const setCurrentOpenedRoom = (roomId) => {
    currentOpenedRoom = roomId;
}

export const getCurrentOpenedRoom = () => {
    return currentOpenedRoom;
}