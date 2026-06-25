import express from "express";
import cors from "cors";

import userRoutes from './routes/user.js';
import messageRoutes from './routes/messages.js'

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json())
app.use('/user',userRoutes);
app.use('/message', messageRoutes);

app.listen(port, () => {
    console.log(`Started at localhost:${port}`)
});

