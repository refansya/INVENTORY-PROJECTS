import ProductModel from "../models/Product.js";
import StockOpnameModel from "../models/StockOpname.js";
import mongoose from "mongoose";

export const getProductsStockOpname = async (req, res) => {
  try {
    const products = await ProductModel.find({}, "_id skubrg name stock createdAt updatedAt").lean();

    const productIds = products.map(p => p._id);
    const latestOpnameRecords = await StockOpnameModel.aggregate([
        { $match: { product: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) } } }, 
        { $sort: { createdAt: -1 } },
        { $group: {
            _id: "$product",
            recordId: { $first: "$_id" }, 
            stokAktual: { $first: "$stokAktual" },
            stokSistemSaatOpname: { $first: "$stokSistem" }, 
            opnameDate: { $first: "$createdAt" },
            isApproved: { $first: "$isApproved" }, 
        }},
        // Proyeksikan output
        { $project: {
            _id: 0,
            product: "$_id",
            recordId: 1, 
            stokAktual: 1,
            stokSistemSaatOpname: 1,
            opnameDate: 1,
            isApproved: 1,
        }}
    ]);

    const opnameMap = new Map(latestOpnameRecords.map(item => [item.product.toString(), item]));

    const productsWithOpname = products.map(p => {
        const opnameData = opnameMap.get(p._id.toString());
        
        const lastOpname = opnameData ? {
            _id: opnameData.recordId, 
            stokAktual: opnameData.stokAktual,
            stokSistemSaatOpname: opnameData.stokSistemSaatOpname, 
            opnameDate: opnameData.opnameDate,
            isApproved: opnameData.isApproved,
        } : null;

        return {
            ...p,
            lastOpname, 
        };
    });

    res.json({ success: true, products: productsWithOpname });
  } catch (error) {
    console.error("Error fetching products for stock opname:", error);
    res.status(500).json({ success: false, error: "Gagal mengambil data produk" });
  }
};

export const createBatchStockOpname = async (req, res) => {
  const { _id: userId, role } = req.user || {};
  
  if (!userId || role !== "admin") {
    return res.status(403).json({ 
      success: false, 
      message: "Akses ditolak. Hanya peran Admin yang dapat mencatat Stock Opname." 
    });
  }

  const { opnameRecords } = req.body;

  if (!opnameRecords || !Array.isArray(opnameRecords) || opnameRecords.length === 0) {
    return res.status(400).json({ success: false, message: "Data opnameRecords tidak valid atau kosong." });
  }

  try {
    const recordsToInsert = [];
    
    for (const record of opnameRecords) {
      const { product: productId, systemStock, physicalStock, difference, note } = record;
      
      if (!productId || !mongoose.Types.ObjectId.isValid(productId) || typeof physicalStock !== 'number') {
        throw new Error("Data produk tidak lengkap atau stok fisik bukan angka.");
      }

      const currentProduct = await ProductModel.findById(productId).select('stock');
      if (!currentProduct) {
          throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
      }
      if (currentProduct.stock !== systemStock) {
        throw new Error(`Stok sistem produk ${currentProduct._id} sudah berubah menjadi ${currentProduct.stock}. Harap muat ulang data opname.`);
      }

      recordsToInsert.push({
        product: productId,
        stokSistem: systemStock, 
        stokAktual: physicalStock, 
        selisih: difference,
        note: note || "", 
        user: userId,
        status: "PENDING", 
        isApproved: false,
      });
    } 

    if (recordsToInsert.length > 0) {
      await StockOpnameModel.insertMany(recordsToInsert);
    }

    res.status(201).json({ 
        success: true, 
        message: "Stock Opname berhasil dicatat dengan status PENDING. Stok produk di sistem tidak diubah hingga disetujui." 
    });

  } catch (error) {
    console.error("Error creating batch stock opname:", error);
    res.status(500).json({ 
        success: false, 
        message: error.message || "Gagal menyimpan data Stock Opname." 
    });
  }
};

export const approveStockOpname = async (req, res) => {
    const { _id: approverId, role } = req.user || {};
    const { recordId } = req.params;

    // Otorisasi
    if (!approverId || (role !== "admin" && role !== "auditor")) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak. Hanya peran Admin/Auditor yang dapat menyetujui Stock Opname."
        });
    }

    if (!mongoose.Types.ObjectId.isValid(recordId)) {
        return res.status(400).json({ success: false, message: "ID catatan opname tidak valid." });
    }

    try {
        const record = await StockOpnameModel.findById(recordId);

        if (!record) {
            throw new Error("Catatan Stock Opname tidak ditemukan.");
        }

        if (record.isApproved) {
            throw new Error("Catatan Stock Opname ini sudah disetujui sebelumnya.");
        }
        
        const currentProduct = await ProductModel.findById(record.product).select('name stock');
        if (!currentProduct) {
             throw new Error("Produk terkait gagal ditemukan.");
        }

        if (currentProduct.stock !== record.stokSistem) {
            throw new Error(`Stok sistem produk "${currentProduct.name}" telah berubah dari ${record.stokSistem} menjadi ${currentProduct.stock} sejak SO dicatat. Harap catat SO baru atau periksa transaksi.`);
        }

        const updatedProduct = await ProductModel.findOneAndUpdate(
            { 
                _id: record.product, 
                stock: record.stokSistem 
            },
            { 
                stock: record.stokAktual 
            },
            { 
                new: true,
                runValidators: true
            } 
        );

        if (!updatedProduct) {
             throw new Error(`Gagal memperbarui stok produk. Stok sistem produk "${currentProduct.name}" telah berubah dari ${record.stokSistem} menjadi ${currentProduct.stock}.`);
        }
        record.status = "APPROVED";
        record.isApproved = true;
        record.approvedBy = approverId;
        record.approvedAt = new Date();
        
        await record.save(); 

        res.status(200).json({
            success: true,
            message: `Stock Opname berhasil disetujui. Stok sistem produk "${updatedProduct.name}" diperbarui ke ${record.stokAktual}.`
        });

    } catch (error) {
        console.error("Error approving stock opname:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Gagal menyetujui Stock Opname. Operasi dibatalkan."
        });
    }
};