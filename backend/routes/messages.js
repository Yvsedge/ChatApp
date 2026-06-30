import express from 'express'
import verifyToken from "../middleware/auth.js"
import * as msg from "../controllers/messageController.js"
const router = express.Router();

router.get("/:id",verifyToken, msg.getMessages);
router.post("/send/:id",verifyToken, msg.createMessages);
router.delete("/:id", verifyToken, msg.deleteMessages);
router.put("/:id", verifyToken, msg.editMessages);

export default router;
