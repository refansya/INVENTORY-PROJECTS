import express from "express";
import {
  getBarangIn,
  addBarangIn,
  updateBarangIn,
  deleteBarangIn,
} from "../controllers/baranginController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",authMiddleware, getBarangIn);
router.post("/add",authMiddleware, addBarangIn);
router.put("/:id",authMiddleware, updateBarangIn);
router.delete("/:id",authMiddleware, deleteBarangIn);

export default router;
