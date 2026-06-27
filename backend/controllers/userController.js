import 'dotenv/config';
import { pool } from '../database/connections.js';

const getAllUsers = async (req, res) => {
    try{
        const result = await pool.query(
            `
                SELECT
                    id,
                    firstname,
                    lastname,
                    email
                FROM users;
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
                    id,
                    firstname,
                    lastname,
                    email
                FROM users
                WHERE id != $1;
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
