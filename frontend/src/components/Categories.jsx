import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, X, Search } from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // "add" | id | null
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryDescription: "",
  });

  // search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/category", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setFormData({
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription,
    });
    setModalMode(category._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this category?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/category/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Error deleting category!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await axios.post(
          "http://localhost:3000/api/category/add",
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
        );
      } else {
        await axios.put(
          `http://localhost:3000/api/category/${modalMode}`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
        );
      }
      setModalMode(null);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Error saving category!");
    }
  };

  // Filtering + searching
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.categoryDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterCategory === "all" || cat.categoryName === filterCategory;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer"
          onClick={() => {
            setFormData({ categoryName: "", categoryDescription: "" });
            setModalMode("add");
          }}
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Categories</option>
          {[...new Set(categories.map((c) => c.categoryName))].map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>


      {/* Table */}
      {loading ? (
        <div className="text-center py-6 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Category Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCategories.map((category, index) => (
                <tr key={category._id}>
                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{category.categoryName}</td>
                  <td className="px-4 py-3">{category.categoryDescription}</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleDelete(category._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-400">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setModalMode(null)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {modalMode === "add" ? "Add Category" : "Edit Category"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                placeholder="Category Name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="categoryDescription"
                value={formData.categoryDescription}
                onChange={handleChange}
                placeholder="Category Description"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg w-full sm:w-auto cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full sm:w-auto cursor-pointer"
                >
                  {modalMode === "add" ? "Add Category" : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
