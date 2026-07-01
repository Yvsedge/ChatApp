import express from 'express'
import verifyToken from "../middleware/auth.js"
import * as user from "../controllers/userController.js"
import * as auth from "../controllers/authController.js"
const router = express.Router();

router.post("/register", auth.register);
router.post("/login", auth.login);
router.get("/", verifyToken, user.getAllUsers);
router.get("/users",verifyToken, user.getUsers);
router.get("/current", verifyToken, user.getCurrent);
router.put("/edit", verifyToken, user.onEdit);
router.delete("/delete", verifyToken, user.deleteUser);

export default router;

