import mongoose from "mongoose";

const stockOpnameSchema = new mongoose.Schema(
  {
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    stokSistem: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    stokAktual: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    selisih: { 
      type: Number, 
      required: true 
    },
    note: { 
      type: String,
      default: ""
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    // --- FIELD BARU UNTUK APPROVAL ---
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"], // Status yang mungkin
      default: "PENDING",
      required: true
    },
    isApproved: {
      type: Boolean,
      default: false,
      required: true
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null // Akan terisi jika disetujui
    },
    approvedAt: {
      type: Date,
      default: null // Akan terisi jika disetujui
    }
    // ---------------------------------
  },
  {
    timestamps: true 
  }
);

const StockOpnameModel = mongoose.model("StockOpname", stockOpnameSchema);

export default StockOpnameModel;