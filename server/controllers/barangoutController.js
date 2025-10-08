import BarangOutModel from "../models/BarangOut.js";
import ProductModel from "../models/Product.js";

// Get all Barang Out
export const getBarangOut = async (req, res) => {
  try {
    const barangOut = await BarangOutModel.find()
      .populate("product", "name skubrg kategori hrgjual")
      .populate("user", "name email role");

    res.json({ success: true, data: barangOut });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add Barang Out
export const addBarangOut = async (req, res) => {
  try {
    const { tanggal, noDokumen, customer, product, jumlah, hargaJual } = req.body;

    if (!tanggal || !noDokumen || !customer || !product || !jumlah || !hargaJual) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi!" });
    }

    const newBarangOut = new BarangOutModel({
      tanggal,
      noDokumen,
      customer,
      product,
      jumlah,
      hargaJual,
      user: req.user._id,
    });

    await newBarangOut.save();

    // Kurangi stok produk
    await ProductModel.findByIdAndUpdate(product, { $inc: { stock: -jumlah } });

    res.json({ success: true, message: "Barang keluar berhasil ditambahkan!", data: newBarangOut });
  } catch (err) {
    console.error("Error addBarangOut:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Barang Out
export const updateBarangOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, noDokumen, customer, product, jumlah, hargaJual } = req.body;

    const oldData = await BarangOutModel.findById(id);
    if (!oldData) return res.status(404).json({ success: false, message: "Data not found" });

    const selisih = jumlah - oldData.jumlah;

    const updated = await BarangOutModel.findByIdAndUpdate(
      id,
      { tanggal, noDokumen, customer, product, jumlah, hargaJual, user: req.user._id },
      { new: true }
    );

    await ProductModel.findByIdAndUpdate(product, { $inc: { stock: -selisih } });

    res.json({ success: true, message: "Barang keluar berhasil diupdate!", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Barang Out
export const deleteBarangOut = async (req, res) => {
  try {
    const { id } = req.params;
    const barangOut = await BarangOutModel.findById(id);
    if (!barangOut) return res.status(404).json({ success: false, message: "Data not found" });

    // Tambah stok saat data dihapus
    await ProductModel.findByIdAndUpdate(barangOut.product, { $inc: { stock: barangOut.jumlah } });

    await BarangOutModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Barang keluar berhasil dihapus!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
