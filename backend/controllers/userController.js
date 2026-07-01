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
                lm.created_at,

                (
                    SELECT COUNT(*)::INT
                    FROM messages m
                    WHERE
                        m.sender_id = u.id
                    AND m.receiver_id = $1
                    AND m.is_read = FALSE
                ) AS unread_count

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

const getCurrent = async (req, res) => {
    try{
        const currentUser = req.user.userId;

        const result = await pool.query(
            `
            SELECT 
            id, firstname, lastname, email, created_at
            from users
            WHERE id = $1
            `,
            [currentUser]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            user : result.rows[0]
        });
    }catch(e){
        console.log(e);

        res.json({
            err : e
        });
    }
}

const onEdit = async (req , res) => {
    try{
        const currentUser = req.user.userId;
        const {firstname, lastname} = req.body;

        const result = await pool.query(
            `
                UPDATE users
                SET firstname = $1, lastname = $2
                WHERE id = $3
                RETURNING *
            `,
            [firstname, lastname, currentUser]
        );

        res.status(201).json({
            user : result.rows[0]
        });
    }catch(e){
        console.log(e);

        res.json({
            err : e
        });
    }
}

const deleteUser = async(req, res) => {
    try{
        const currentUser = req.user.userId;
        const result = await pool.query(
            `
                DELETE from users
                WHERE id = $1
                RETURNING *
            `,
            [currentUser]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "Successfully deleted",
        });

    }catch(e){
        console.log(e);

        res.json({
            err : e
        });
    }   
}

/*
CREATE TABLE users (
    id UUID PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP,
);
*/

export {
    getAllUsers,
    getUsers,
    getCurrent,
    onEdit,
    deleteUser
}
