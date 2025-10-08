import express from 'express';
import { addProduct, getProduct, updateProduct, deleteProduct} from '../controllers/productController.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/add',authMiddleware, addProduct);
router.get('/', authMiddleware, getProduct );
router.put('/:id', authMiddleware, updateProduct );
router.delete('/:id', authMiddleware, deleteProduct);

export default router;