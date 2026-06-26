import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
import { pool } from './connections.js';


const register = async(req, res) => {
    try{
        const {id, firstname, lastname, mail, password} = req.body;

        if(!id || !firstname || !lastname || !mail || !password){
            return res.status(400).json({
                message: "Invalid Field"
            });
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [mail]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        const result = await pool.query(
            `INSERT INTO users(id, firstname, lastname, email,password,created_at) 
            VALUES($1, $2, $3, $4,$5, CURRENT_TIMESTAMP) RETURNING *`,
            [id, firstname, lastname, mail, hashedpassword]
        )
        res.status(201).json({
            id: result.rows[0].id,
            firstname: result.rows[0].firstname,
            lastname: result.rows[0].lastname,
            email: result.rows[0].email
        });
    }catch(e){
        console.log(e);

        res.json({
            err : e
        });
    }
}

const login = async(req, res) => {
    try{
        const {mail, password} = req.body;

        const result = await pool.query(
            `
            SELECT * FROM users
            WHERE email = $1
            `,[mail]
        );

        if(result.rows.length === 0){
            return res.status(401).json({
                message: "Invalid Email or Passowrd"
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if(!passwordMatch){
            return res.status(401).json({
                message: "Invalid Password"
            });
        };

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            token,
            id : user.id
        });
    }catch(e){
        console.log(e);
        res.json({
            err : e
        });
    }
}

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
        const id = req.params.id;

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
            [id]
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
    register,
    login,
    getUsers,
    getMessages,
    getAllUsers,
    createMessages
}
