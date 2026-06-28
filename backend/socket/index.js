import { Server } from 'socket.io';
import 'dotenv/config';

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);

        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`${userId} joined`);
        });
    });

    return io;
}

export function getIO() {
    return io;
}
