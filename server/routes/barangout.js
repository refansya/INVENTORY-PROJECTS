import express from "express";
import {
  getBarangOut,
  addBarangOut,
  updateBarangOut,
  deleteBarangOut,
} from "../controllers/barangoutController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getBarangOut);
router.post("/add", authMiddleware, addBarangOut);
router.put("/:id", authMiddleware, updateBarangOut);
router.delete("/:id", authMiddleware, deleteBarangOut);

export default router;
