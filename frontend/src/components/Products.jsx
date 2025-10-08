import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const Products = () => {
  const [addEditModal, setAddEditModal] = useState(null);
  const [_loading, _setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [formData, setFormData] = useState({
    skubrg: "",
    name: "",
    kategori: "",
    hrg: "",
    hrgjual: "",
    stock: "",
    foto: "",
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // fetch products
  const fetchProducts = async () => {
    _setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/product", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      console.log("API Response:", response.data);
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      _setLoading(false);
    }
  };

  // fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/category", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleEdit = (product) => {
    setFormData({
      skubrg: product.skubrg,
      name: product.name,
      kategori: product.kategori,
      hrg: product.hrg,
      hrgjual: product.hrgjual,
      stock: product.stock,
      foto: product.foto,
    });
    setAddEditModal(product._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await axios.delete(`http://localhost:3000/api/product/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });

      if (response.data.success) {
        alert("Product deleted successfully!");
        fetchProducts();
      } else {
        alert("Error deleting product!");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting product!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (addEditModal === "add") {
        const response = await axios.post(
          "http://localhost:3000/api/product/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Product added successfully!");
          setAddEditModal(null);
          fetchProducts();
        } else {
          alert("Error adding product!");
        }
      } else {
        const response = await axios.put(
          `http://localhost:3000/api/product/${addEditModal}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Product updated successfully!");
          setAddEditModal(null);
          fetchProducts();
        } else {
          alert("Error updating product!");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product!");
    }
  };

  // search & filter
  const filteredProduct = products.filter((product) => {
    const matchSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.kategori.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ? true : product.kategori.toLowerCase() === filter.toLowerCase();

    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer"
          onClick={() => {
            setFormData({
              skubrg: "",
              name: "",
              kategori: "",
              hrg: "",
              hrgjual: "",
              stock: "",
              foto: "",
            });
            setAddEditModal("add");
          }}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="All">All Categories</option>
          {[...new Set(products.map((p) => p.kategori))].map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {_loading ? (
        <div className="text-center py-6 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Harga Awal</th>
                <th className="px-4 py-3 text-left">Harga Jual</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Foto</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProduct.map((product, index) => (
                <tr key={product._id}>
                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{product.skubrg}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.kategori}</td>
                  <td className="px-4 py-3">Rp {product.hrg}</td>
                  <td className="px-4 py-3">Rp {product.hrgjual}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">{product.foto}</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProduct.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {addEditModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setAddEditModal(null)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {addEditModal === "add" ? "Add Product" : "Edit Product"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="skubrg"
                value={formData.skubrg}
                onChange={handleChange}
                placeholder="SKU Barang"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {/* Dropdown kategori */}
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="hrg"
                value={formData.hrg}
                onChange={handleChange}
                placeholder="Harga Awal"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                name="hrgjual"
                value={formData.hrgjual}
                onChange={handleChange}
                placeholder="Harga Jual"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="foto"
                value={formData.foto}
                onChange={handleChange}
                placeholder="Foto (URL)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddEditModal(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg w-full sm:w-auto cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full sm:w-auto cursor-pointer"
                >
                  {addEditModal === "add" ? "Add Product" : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
