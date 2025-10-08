import Product from "../models/Product.js";

const addProduct = async (req, res) => {
  try {
    const { skubrg, name, kategori, hrg, hrgjual, stock, foto } = req.body;

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product already exists" });
    }

    const newProduct = new Product({
    skubrg,
    name,
    kategori,
    hrg,
    hrgjual,
    stock,
    foto,
    });

    await newProduct.save();
    return res
      .status(201)
      .json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding Product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

const getProduct = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching Product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error in getting Product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { skubrg, name, kategori, hrg, hrgjual, stock, foto } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndUpdate(
      id,
      { skubrg, name, kategori, hrg, hrgjual, stock, foto },
      { new: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating Product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting Product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

export { addProduct, getProduct, updateProduct, deleteProduct };