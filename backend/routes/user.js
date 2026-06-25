import express from 'express'
import * as db from "../database/queries.js";
const router = express.Router();

router.post("/register", db.register);
router.post("/login", db.login);
router.get("/", db.getAllUsers);
router.get("/:id", db.getUsers);

export default router;
