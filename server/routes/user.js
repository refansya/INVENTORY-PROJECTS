import express from "express";
import { getUsers, addUser, updateUser, deleteUser, getMe, updateMe } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.get("/",authMiddleware, getUsers);
router.post("/add",authMiddleware, addUser);
router.put("/:id",authMiddleware, updateUser);
router.delete("/:id",authMiddleware, deleteUser);


export default router;
