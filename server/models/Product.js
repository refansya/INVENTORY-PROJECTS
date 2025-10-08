import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  skubrg: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  kategori: { 
    type: String, 
    required: true 
    
  },
  hrg: { 
    type: Number, 
    required: true, 
    min: 0 
  },      
  hrgjual: { 
    type: Number, 
    required: true, 
    min: 0 
  },  
  stock: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0 
  },    
  foto: { 
    type: String, 
    required: false,
    default: "" 
  },     
  CreatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
