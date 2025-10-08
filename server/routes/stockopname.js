import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
import { 
    getProductsStockOpname, 
    createBatchStockOpname,
    approveStockOpname, // <--- Import controller baru
    // Anda mungkin juga perlu mengimpor controller untuk melihat riwayat opname (getHistory)
} from '../controllers/stockOpnameController.js'; 

const router = express.Router();

// 1. GET: Mengambil daftar produk + data opname terakhir untuk Form Opname
router.get('/', authMiddleware, getProductsStockOpname);

// 2. POST: Membuat/Mencatat Stock Opname baru (Default status PENDING)
router.post(
    '/batch', 
    authMiddleware, 
    createBatchStockOpname
); 

// 3. PUT: Route baru untuk menyetujui Stock Opname (Approval)
// :recordId adalah ID dari catatan Stock Opname yang akan disetujui.
// Route ini memerlukan otorisasi (hanya Admin/Auditor yang bisa akses, dicek di controller).
router.put(
    '/approve/:recordId', 
    authMiddleware, 
    approveStockOpname
);

// (Opsional: Tambahkan route untuk mengambil seluruh riwayat Stock Opname)
// router.get('/history', authMiddleware, getStockOpnameHistory);


export default router;