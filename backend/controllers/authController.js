import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import 'dotenv/config';
import { pool } from '../database/connections.js';

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

export {
    register,
    login
}
