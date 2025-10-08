import mongoose from "mongoose";

const barangInSchema = new mongoose.Schema({
  tanggal: { type: Date, required: true },
  noDokumen: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  jumlah: { type: Number, required: true },
  hargaBeli: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
}, { timestamps: true });

export default mongoose.model("BarangIn", barangInSchema);
