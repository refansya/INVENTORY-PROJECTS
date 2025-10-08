import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, Plus, X } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [addEditModal, setAddEditModal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    divisi: "",
    role: "",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addEditModal === "add") {
        await axios.post("http://localhost:3000/api/users/add", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
        });
      } else {
        await axios.put(`http://localhost:3000/api/users/${addEditModal}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
        });
      }
      setAddEditModal(null);
      fetchUsers();
    } catch (err) {
      console.error("Save user error:", err);
      alert("Gagal menyimpan user!");
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus user ini?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("pos-token")}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => {
            setFormData({ name: "", email: "", password: "", divisi: "", role: "karyawan" });
            setAddEditModal("add");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Plus size={18} /> Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Divisi</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Created At</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((u, idx) => (
              <tr key={u._id}>
                <td className="px-4 py-3">{idx + 1}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.divisi || "-"}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setFormData({
                        name: u.name,
                        email: u.email,
                        password: "",
                        divisi: u.divisi,
                        role: u.role,
                      });
                      setAddEditModal(u._id);
                    }}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400">
                  Tidak ada user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {addEditModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
            <button className="absolute top-4 right-4" onClick={() => setAddEditModal(null)}>
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {addEditModal === "add" ? "Tambah User" : "Edit User"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nama" className="w-full px-4 py-2 bg-gray-700 rounded-lg" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-2 bg-gray-700 rounded-lg" />
              {addEditModal === "add" && (
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-4 py-2 bg-gray-700 rounded-lg" />
              )}
              <input type="text" name="divisi" value={formData.divisi} onChange={handleChange} placeholder="Divisi" className="w-full px-4 py-2 bg-gray-700 rounded-lg" />
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 rounded-lg">
                <option value="admin">Admin</option>
                <option value="karyawan">Karyawan</option>
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setAddEditModal(null)} className="px-4 py-2 bg-gray-600 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded-lg">
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

export default Users;
