import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const BarangIn = () => {
  const [addEditModal, setAddEditModal] = useState(null);
  const [_loading, _setLoading] = useState(true);
  const [barangIn, setBarangIn] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    tanggal: "",
    noDokumen: "",
    supplier: "",
    product: "",
    jumlah: "",
    hargaBeli: "",
  });

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  // Fetch Barang In
  const fetchBarangIn = async () => {
    _setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/barangin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      setBarangIn(response.data.data || []);
    } catch (err) {
      console.error("Error fetching BarangIn:", err);
    } finally {
      _setLoading(false);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/product", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/supplier", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      setSuppliers(response.data.suppliers || []);
    } catch (err) {
      console.error("Error fetching supplier:", err);
    }
  };

  useEffect(() => {
    fetchBarangIn();
    fetchProducts();
    fetchSuppliers();
  }, []);

  // Handle Edit
  const handleEdit = (item) => {
    const selectedProduct = products.find((p) => p._id === item.product?._id);
    setFormData({
      tanggal: item.tanggal.split("T")[0],
      noDokumen: item.noDokumen,
      supplier: item.supplier?._id || "",
      product: item.product?._id || "",
      jumlah: item.jumlah,
      hargaBeli: selectedProduct ? selectedProduct.hrg : "",
    });
    setAddEditModal(item._id);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data Barang Masuk ini?")) return;
    try {
      const res = await axios.delete(`http://localhost:3000/api/barangin/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      if (res.data.success) {
        alert("Barang masuk berhasil dihapus!");
        fetchBarangIn();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal hapus data!");
    }
  };

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Otomatis isi hargaBeli ketika memilih produk
    if (name === "product") {
      const selectedProduct = products.find((p) => p._id === value);
      setFormData((prev) => ({
        ...prev,
        product: value,
        hargaBeli: selectedProduct ? selectedProduct.hrg : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addEditModal === "add") {
        const res = await axios.post(
          "http://localhost:3000/api/barangin/add",
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
        );
        if (res.data.success) {
          alert("Barang masuk berhasil ditambahkan!");
          setAddEditModal(null);
          fetchBarangIn();
        }
      } else {
        const res = await axios.put(
          `http://localhost:3000/api/barangin/${addEditModal}`,
          formData,
          { headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` } }
        );
        if (res.data.success) {
          alert("Barang masuk berhasil diupdate!");
          setAddEditModal(null);
          fetchBarangIn();
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Gagal simpan data!");
    }
  };

  // Filter Function
  const isSameDate = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const filteredBarangIn = barangIn.filter((item) => {
    const productName = item.product?.name || "";
    const supplierName = item.supplier?.name || "";

    const matchSearch =
      item.noDokumen.toLowerCase().includes(search.toLowerCase()) ||
      productName.toLowerCase().includes(search.toLowerCase()) ||
      supplierName.toLowerCase().includes(search.toLowerCase());

    let matchFilter = true;
    if (filterType !== "All" && filterDate) {
      const itemDate = new Date(item.tanggal);
      const selectedDate = new Date(filterDate);

      if (filterType === "Day") matchFilter = isSameDate(itemDate, selectedDate);
      else if (filterType === "Month")
        matchFilter =
          itemDate.getFullYear() === selectedDate.getFullYear() &&
          itemDate.getMonth() === selectedDate.getMonth();
      else if (filterType === "Year") matchFilter = itemDate.getFullYear() === selectedDate.getFullYear();
    }

    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Barang Masuk</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer"
          onClick={() => {
            setFormData({
              tanggal: "",
              noDokumen: "",
              supplier: "",
              product: "",
              jumlah: "",
              hargaBeli: "",
            });
            setAddEditModal("add");
          }}
        >
          <Plus size={18} /> Tambah Barang Masuk
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari No Dokumen, Supplier atau Produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="All">Semua Tanggal</option>
          <option value="Day">Hari</option>
          <option value="Month">Bulan</option>
          <option value="Year">Tahun</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
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
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">No Dokumen</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-left">Produk</th>
                <th className="px-4 py-3 text-left">Jumlah</th>
                <th className="px-4 py-3 text-left">Harga Beli</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredBarangIn.map((item, index) => (
                <tr key={item._id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{item.tanggal.split("T")[0]}</td>
                  <td className="px-4 py-3">{item.noDokumen}</td>
                  <td className="px-4 py-3">{item.supplier?.name || "-"}</td>
                  <td className="px-4 py-3">{item.product?.name || "-"}</td>
                  <td className="px-4 py-3">{item.jumlah}</td>
                  <td className="px-4 py-3">
                    {item.hargaBeli !== undefined && item.hargaBeli !== null
                      ? `Rp ${item.hargaBeli.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{item.user?.name || "-"}</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBarangIn.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-400">
                    Tidak ada data.
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
              {addEditModal === "add" ? "Tambah Barang Masuk" : "Edit Barang Masuk"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <input
                type="text"
                name="noDokumen"
                value={formData.noDokumen}
                onChange={handleChange}
                placeholder="No Dokumen"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              >
                <option value="">Pilih Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name}
                  </option>
                ))}
              </select>
              <select
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              >
                <option value="">Pilih Produk</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — Rp {p.hrg !== undefined && p.hrg !== null ? p.hrg.toLocaleString() : "-"}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                placeholder="Jumlah"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
              <input
                type="number"
                name="hargaBeli"
                value={formData.hargaBeli || ""}
                onChange={handleChange}
                placeholder="Harga Beli"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                disabled
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddEditModal(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                >
                  {addEditModal === "add" ? "Tambah" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarangIn;
