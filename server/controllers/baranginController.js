import BarangInModel from "../models/BarangIn.js";
import ProductModel from "../models/Product.js";

// Get all Barang In
export const getBarangIn = async (req, res) => {
  try {
    const barangIn = await BarangInModel.find()
      .populate("product", "name skubrg kategori hrg")
      .populate("supplier", "name")
      .populate("user", "name email role"); 
    res.json({ success: true, data: barangIn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add Barang In
export const addBarangIn = async (req, res) => {
  try {
    const { tanggal, noDokumen, supplier, product, jumlah, hargaBeli } = req.body;

    const newBarangIn = new BarangInModel({
      tanggal,
      noDokumen,
      supplier,
      product,
      jumlah,
      hargaBeli,
      user: req.user._id, // ✅ ambil dari JWT, bukan dari frontend
    });

    await newBarangIn.save();

    // Update stok produk
    await ProductModel.findByIdAndUpdate(product, {
      $inc: { stock: jumlah },
    });

    res.json({ success: true, message: "Barang masuk berhasil ditambahkan!", data: newBarangIn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Barang In
export const updateBarangIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, noDokumen, supplier, product, jumlah, hargaBeli } = req.body;

    const oldData = await BarangInModel.findById(id);
    if (!oldData) return res.status(404).json({ success: false, message: "Data not found" });

    // Hitung selisih jumlah untuk update stok
    const selisih = jumlah - oldData.jumlah;

    const updated = await BarangInModel.findByIdAndUpdate(
      id,
      {
        tanggal,
        noDokumen,
        supplier,
        product,
        jumlah,
        hargaBeli,
        user: req.user._id, // ✅ catat siapa yang terakhir update
      },
      { new: true }
    );

    // Update stok produk sesuai selisih
    await ProductModel.findByIdAndUpdate(product, { $inc: { stock: selisih } });

    res.json({ success: true, message: "Barang masuk berhasil diupdate!", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Barang In
export const deleteBarangIn = async (req, res) => {
  try {
    const { id } = req.params;
    const barangIn = await BarangInModel.findById(id);
    if (!barangIn) return res.status(404).json({ success: false, message: "Data not found" });

    // Kurangi stok saat data dihapus
    await ProductModel.findByIdAndUpdate(barangIn.product, {
      $inc: { stock: -barangIn.jumlah },
    });

    await BarangInModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Barang masuk berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
