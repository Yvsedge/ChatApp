import express from "express";
import cors from "cors";
import { createServer } from 'node:http';
import userRoutes from './routes/user.js';
import messageRoutes from './routes/messages.js'
import { initSocket } from "./socket/index.js";

const port = 3000;
const app = express();
const server = createServer(app);
initSocket(server);


app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json())
app.use('/user',userRoutes);
app.use('/message', messageRoutes);


server.listen(port, () => {
    console.log(`Started at localhost:${port}`)
});

