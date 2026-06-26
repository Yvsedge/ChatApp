import express from 'express'
import * as db from "../database/queries.js";
import verifyToken from "../middleware/auth.js"
const router = express.Router();

router.get("/:id",verifyToken, db.getMessages);
router.post("/send/:id",verifyToken, db.createMessages)

export default router;
