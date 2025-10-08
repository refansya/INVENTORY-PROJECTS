import express from 'express';
import { addSupplier, getSupplier, updateSupplier, deleteSupplier} from '../controllers/supplierController.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/add',authMiddleware, addSupplier);
router.get('/', authMiddleware, getSupplier );
router.put('/:id', authMiddleware, updateSupplier );
router.delete('/:id', authMiddleware, deleteSupplier);

export default router;