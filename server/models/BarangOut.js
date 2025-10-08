import mongoose from "mongoose";

const barangOutSchema = new mongoose.Schema({
  tanggal: { type: Date, required: true },
  noDokumen: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  jumlah: { type: Number, required: true },
  hargaJual: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("BarangOut", barangOutSchema);
