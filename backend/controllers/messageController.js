import 'dotenv/config';
import { pool } from '../database/connections.js';


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

export {
    getMessages,
    createMessages,
}
