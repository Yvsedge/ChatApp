import 'dotenv/config';
import { pool } from '../database/connections.js';
import { getIO } from '../socket/index.js';
const getMessages = async (req, res) => {
    try{
        const senderid = req.user.userId;
        const receiverid = req.params.id;

        const result = await pool.query(
            `
            SELECT *
            FROM messages
            WHERE
                (sender_id = $1 AND receiver_id = $2)
            OR
                (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC;
            `,[senderid,receiverid]
        );

        if(result.rows.length === 0){
            return res.json({
                message: []
            });
        }

        return res.status(200).json({
            message: result.rows});
    }catch(e){
        console.log(e);

        res.json({
            message: e
        });
    }
}

const createMessages = async (req,res) => {
    try{
        const senderid = req.user.userId;
        const receiverid = req.params.id;
        const {id, content} = req.body;
        const result = await pool.query(
            `
            INSERT INTO messages
            (id, sender_id, receiver_id, content, created_at)
            values($1,$2,$3,$4,CURRENT_TIMESTAMP)
            RETURNING *
            ;
            `,
            [id, senderid, receiverid, content]
        );
        const message = result.rows[0];

        const io = getIO();

        io.to(receiverid).emit("receiver_message", message);
        io.to(senderid).emit("receiver_message", message);

        res.status(201).json({
            content: result.rows[0].content,
        });
    }catch(e){
        console.log(e);

        res.json({
            err : e
        });
    }
}

const deleteMessages = async (req, res) => {
    try{
        const senderid = req.user.userId;
        const receiverid = req.params.id;
        const id = req.body.id;
        const result = await pool.query(
            `
                DELETE FROM messages
                WHERE id = $1
                AND
                sender_id = $2
                AND
                receiver_id = $3
                RETURNING *
            `,
            [id, senderid, receiverid]
        );
        const message = result.rows;
        const deletedMessage = result.rows[0];

        const io = getIO();

        io.to(senderid).emit("message_deleted", {
            id: deletedMessage.id,
            receiverId: receiverid,
            senderId : senderid,
        });

        io.to(receiverid).emit("message_deleted", {
            id: deletedMessage.id,
            senderId: senderid,
            receiverId: receiverid,
        });

        res.status(200).json({
            content: message
        });
    }catch(e){
        console.log(e);

        res.json({
            err: e
        });
    }
}

const editMessages = async (req, res) => {
    try{
        const senderid = req.user.userId;
        const receiverid = req.params.id;
        const {id, content} = req.body;
        const result = await pool.query(
            `
            UPDATE messages
            SET content = $1
            WHERE id = $2
            AND
            sender_id = $3
            AND
            receiver_id = $4
            Returning *
            `,
            [content, id, senderid, receiverid]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Message not found",
            });
        }
        const message = result.rows[0];
        

        const io = getIO();

        io.to(senderid).emit("message_updated", {
            message: message,
            receiverId: receiverid,
            senderId : senderid,
        });
        io.to(receiverid).emit("message_updated", {
            message: message,
            receiverId: receiverid,
            senderId : senderid,
        });

        res.status(200).json({
            content: message
        });
    }catch(e){
        console.log(e);

        res.json({
            err: e
        });
    }
}

export {
    getMessages,
    createMessages,
    deleteMessages,
    editMessages
}
