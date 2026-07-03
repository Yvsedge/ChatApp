import { Server } from 'socket.io';
import {
    addSocket,
    removeSocket,
    getOnlineUsers,
} from "./presence.js";
import 'dotenv/config';

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        }
    });

    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);

        socket.on("join", (userId) => {
            socket.data.userId = userId;

            addSocket(userId, socket.id);

            socket.join(userId);

            console.log(`${userId} joined`);

            io.emit("online_users", getOnlineUsers());
        });

        socket.on("disconnect", (reason) => {
            console.log("Disconnected:", socket.id, reason);

            const userId = socket.data.userId;

            if (!userId) return;

            removeSocket(userId, socket.id);

            console.log(getOnlineUsers());

            io.emit("online_users", getOnlineUsers());
        })

        socket.on("typing", ({senderId, receiverId}) => {
            io.to(receiverId).emit("typing", {
                senderId,
            });
        })

        socket.on("stop_typing", ({senderId, receiverId}) => {
            io.to(receiverId).emit("stop_typing", {
                senderId,
            });
        })

    });

    return io;
}

export function getIO() {
    return io;
}
