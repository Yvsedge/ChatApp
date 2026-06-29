import 'dotenv/config';
import { pool } from '../database/connections.js';

const getAllUsers = async (req, res) => {
    try{
        const result = await pool.query(
            `
                SELECT
                    users.id,
                    users.firstname,
                    users.lastname,
                    users.email,
                    messages.content,
                    messages.created_at
                FROM users
                LEFT JOIN messages
                on
                users.id = messages.receiver_id;
            `
        );

        res.status(201).json(result.rows);
    }catch(e){
        console.log(e);

        res.json({
            err : e
        });
    }
}

const getUsers = async (req, res) => {
    try{
        const currentUser = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                u.id,
                u.firstname,
                u.lastname,
                u.email,
                lm.content,
                lm.created_at
            FROM users u
            LEFT JOIN LATERAL (
                SELECT content, created_at
                FROM messages m
                WHERE
                    (m.sender_id = $1 AND m.receiver_id = u.id)
                    OR
                    (m.sender_id = u.id AND m.receiver_id = $1)
                ORDER BY m.created_at DESC
                LIMIT 1
            ) lm ON TRUE
            WHERE u.id <> $1
            ORDER BY lm.created_at DESC NULLS LAST;
            `,
            [currentUser]
        );

        res.status(201).json({
            users : result.rows
        });
    }catch(e){
        console.log(e);

        res.json({
            err : e
        });
    }
}

export {
    getAllUsers,
    getUsers,
}
