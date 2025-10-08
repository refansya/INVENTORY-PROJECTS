import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const Suppliers = () => {
  const [addEditModal, setAddEditModal] = useState(null); 
  const [_loading, _setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // State tambahan
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchSuppliers = async () => {
    _setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/supplier", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      setSuppliers(response.data.suppliers || []);
    } catch (err) {
      console.error("Error fetching supplier:", err);
    } finally {
      _setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
    });
    setAddEditModal(supplier._id); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const response = await axios.delete(`http://localhost:3000/api/supplier/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });

      if (response.data.success) {
        alert("Supplier deleted successfully!");
        fetchSuppliers();
      } else {
        alert("Error deleting supplier!");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting supplier!");
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
          "http://localhost:3000/api/supplier/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Supplier added successfully!");
          setAddEditModal(null);
          fetchSuppliers();
        } else {
          alert("Error adding supplier!");
        }
      } else {
        const response = await axios.put(
          `http://localhost:3000/api/supplier/${addEditModal}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Supplier updated successfully!");
          setAddEditModal(null);
          fetchSuppliers();
        } else {
          alert("Error updating supplier!");
        }
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Error saving supplier!");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchSearch =
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.email.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ? true : supplier.address.toLowerCase().includes(filter.toLowerCase());

    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Supplier Management</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer"
          onClick={() => {
            setFormData({ name: "", email: "", phone: "", address: "" });
            setAddEditModal("add");
          }}
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="All">All Addresses</option>
          {[...new Set(suppliers.map((s) => s.address))].map((addr) => (
            <option key={addr} value={addr}>
              {addr}
            </option>
          ))}
        </select>
      </div>

      {_loading ? (
        <div className="text-center py-6 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Supplier Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSuppliers.map((supplier, index) => (
                <tr key={supplier._id}>
                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3">{supplier.email}</td>
                  <td className="px-4 py-3">{supplier.phone}</td>
                  <td className="px-4 py-3">{supplier.address}</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleDelete(supplier._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400">
                    No suppliers found.
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
              {addEditModal === "add" ? "Add Supplier" : "Edit Supplier"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Supplier Name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Supplier Email"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Supplier Phone Number"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Supplier Address"
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
                  {addEditModal === "add" ? "Add Supplier" : "Update Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
