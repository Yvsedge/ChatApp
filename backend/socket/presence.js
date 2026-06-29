const onlineUsers = new Map();
const istyping = [];

function addSocket(userId, socketId) {
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socketId);
}

function removeSocket(userId, socketId) {
    if (!onlineUsers.has(userId)) return;

    const sockets = onlineUsers.get(userId);

    sockets.delete(socketId);

    if (sockets.size === 0) {
        onlineUsers.delete(userId);
    }
}

function isOnline(userId) {
    return onlineUsers.has(userId);
}

function getOnlineUsers() {
    return [...onlineUsers.keys()];
}



export {
    addSocket,
    removeSocket,
    isOnline,
    getOnlineUsers,

}
